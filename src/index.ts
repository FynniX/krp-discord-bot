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
})

client.on('interactionCreate', (interaction) => {
  client.executeInteraction(interaction)
})

// import commands
import './commands/ProfileCommands.js'
import './commands/MemberCommands.js'
import './commands/ModsCommands.js'
import './commands/GenerateCommands.js'

// Login discord bot
client.login(process.env.BOT_TOKEN as string)
