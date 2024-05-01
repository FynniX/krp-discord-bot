import { copyFileSync, existsSync, mkdirSync, rmSync } from 'fs'
import { ProcessMessage } from './enums/ProcessMessage.js'
import { GeneratorMessage } from './interfaces/GeneratorMessage.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { prisma } from './lib/prisma.js'
import { exec } from 'child_process'
import admzip from 'adm-zip'

function absolutePath(path: string) {
  return join(dirname(fileURLToPath(import.meta.url)), path)
}

async function lockAsync(path: string, guid: string) {
  return new Promise((resolve, reject) => {
    exec(`${process.platform !== 'win32' ? 'wine ' : ''}lock.exe "${path}" /${guid}`, (error, stdout) => {
      if (error !== null) {
        reject(stdout.trim())
        return
      }

      resolve(stdout.trim())
    })
  })
}

async function createZip(tmpDir: string, filepath: string) {
  const zip = new admzip()
  zip.addLocalFolder(tmpDir)
  return zip.writeZipPromise(filepath)
}

const modsFolder = absolutePath('../mods')
const tmpFolder = absolutePath('../tmp')
const publicFolder = absolutePath('../public')

// Create folder structure when don't exist
if (!existsSync(modsFolder)) mkdirSync(modsFolder, { recursive: true })

if (!existsSync(tmpFolder)) mkdirSync(tmpFolder, { recursive: true })

if (!existsSync(publicFolder)) mkdirSync(publicFolder, { recursive: true })

async function start(memberId: number, modId: number) {
  if (!process.send) process.exit()

  // Check weather args are correct
  if (memberId === -1 || modId === -1) {
    process.send({ type: ProcessMessage.Result, success: false, message: 'Member or mod not found' })
    return
  }

  // Set progress to start
  process.send({ type: ProcessMessage.Progress, progress: 0 })

  // Find member and mod
  const member = await prisma.member.findUnique({ where: { id: memberId, guid: { not: null } } })
  const mod = await prisma.mods.findUnique({ where: { id: modId } })

  if (!member || !mod) {
    process.send({ type: ProcessMessage.Result, success: false, message: 'Member or mod not found' })
    return
  }

  process.send({ type: ProcessMessage.Progress, progress: 10 })

  // Limit to 2 requests per day per track if not a admin
  if (!member.isAdmin) {
    const files = await prisma.files.findMany({
      where: {
        memberId: member.id,
        modId: mod.id,
        createdAt: {
          lte: new Date(Date.now()).toISOString(),
          gte: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        }
      }
    })

    if (files.length > 2) {
      process.send({
        type: ProcessMessage.Result,
        success: false,
        message: 'You can only request 2 files of the same mod per hour'
      })
      return
    }
  }

  process.send({ type: ProcessMessage.Progress, progress: 20 })

  const file = await prisma.files.create({
    data: {
      member: { connect: { id: member.id } },
      mod: { connect: { id: mod.id } }
    }
  })

  process.send({ type: ProcessMessage.Progress, progress: 30 })

  const modFile = join(modsFolder, mod.filename)
  const tmpDir = join(tmpFolder, file.id.toFixed(0))
  const filepath = join(publicFolder, `${file.id.toFixed(0)}.zip`)
  const filename = `${file.id.toFixed(0)}.zip`

  process.send({ type: ProcessMessage.Progress, progress: 40 })

  // Create tmp folder
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })

  try {
    copyFileSync(modFile, join(tmpDir, mod.filename))
  } catch (err) {
    console.error(err)
    rmSync(tmpDir, { recursive: true })
    process.send({ type: ProcessMessage.Result, success: false, message: 'Mod file could not be copied' })
    return
  }

  process.send({ type: ProcessMessage.Progress, progress: 50 })

  try {
    await lockAsync(
      process.platform !== 'win32' ? join('tmp', file.id.toFixed(0), mod.filename) : join(tmpDir, mod.filename),
      member.guid as string
    )
  } catch (err) {
    console.error(err)
    rmSync(tmpDir, { recursive: true })
    process.send({ type: ProcessMessage.Result, success: false, message: 'Mod file could not be locked' })
    return
  }

  process.send({ type: ProcessMessage.Progress, progress: 60 })

  try {
    await createZip(tmpDir, filepath)
  } catch (err) {
    console.error(err)
    rmSync(tmpDir, { recursive: true })
    process.send({ type: ProcessMessage.Result, success: false, message: 'Mod file could not be zipped' })
    return
  }

  process.send({ type: ProcessMessage.Progress, progress: 70 })

  process.send({ type: ProcessMessage.Progress, progress: 80 })

  await prisma.files.update({
    where: { id: file.id },
    data: {
      hasFailed: false,
      isFinished: true
    }
  })

  process.send({ type: ProcessMessage.Progress, progress: 90 })

  rmSync(tmpDir, { recursive: true })

  process.send({ type: ProcessMessage.Progress, progress: 100 })

  process.send({ type: ProcessMessage.Result, success: true, filename })
}

process.on('message', (message: GeneratorMessage) => {
  switch (message.type) {
    case ProcessMessage.Start:
      start(message.memberId ?? -1, message.modId ?? -1)
      break
    default:
      process.exit()
  }
})
