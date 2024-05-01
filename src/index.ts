import { check as env } from './utils/env.js'
import { app } from './lib/express.js'
import { client } from './lib/discord.js'

// Check environment variables
env()

client.on('ready', async () => {
  console.log('>> Bot started')

  // to create/update/delete discord application commands
  await client.initApplicationCommands()

  // Start express server
  app.listen(process.env.PORT, () =>
    console.log(`>> Webserver started on http://localhost:${process.env.WEBSERVER_PORT}/`)
  )
})

client.on('interactionCreate', (interaction) => {
  client.executeInteraction(interaction)
})

// import commands
import './commands/ProfileCommands.js'

// Login discord bot
client.login(process.env.BOT_TOKEN as string)
