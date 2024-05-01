import { existsSync, rmSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

export const removeFile = (filename: string) => {
  const path = join(dirname(fileURLToPath(import.meta.url)), '../public', filename)
  if (!existsSync(path)) return
  rmSync(path)
}
