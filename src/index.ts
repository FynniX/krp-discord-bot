import { check as env } from './utils/env.js'
import { client } from './lib/discord.js'
import { app } from './lib/express.js'

// Check environment variables
env()

client.on('ready', async () => {
  console.log('>> Bot started')

  // to create/update/delete discord application commands
  await client.initApplicationCommands()

  // Start express server
  app.listen(parseInt(process.env.WEBSERVER_PORT as string), () =>
    console.log(`>> Webserver started on http://localhost:${process.env.WEBSERVER_PORT}/`)
  )

  // Check weather a file expired each hour
  setInterval(
    async () => {
      const lte = new Date(Date.now() - 1000 * 60 * 60).toISOString()

      const files = await prisma.files.findMany({
        where: {
          createdAt: { lte },
          isExpired: false
        }
      })

      await prisma.files.updateMany({
        where: {
          createdAt: { lte }
        },
        data: {
          isExpired: true
        }
      })

      for (const file of files) removeFile(`${file.id.toFixed(0)}.zip`)
    },
    1000 * 60 * 60
  )
})

client.on('interactionCreate', (interaction) => {
  client.executeInteraction(interaction)
})

// import commands
import './commands/ProfileCommands.js'
import './commands/MemberCommands.js'
import './commands/ModsCommands.js'
import './commands/GenerateCommands.js'
import { prisma } from './lib/prisma.js'
import { removeFile } from './utils/files.js'

// Login discord bot
client.login(process.env.BOT_TOKEN as string)
