import { Collection, Guild, GuildMember } from 'discord.js'
import { client } from '../lib/discord.js'

export let guild: Guild | undefined
export let members: Collection<string, GuildMember> | undefined

client.on('ready', async () => {
  guild = await client.guilds.fetch(process.env.GUILD_ID as string)
  members = await guild.members.fetch()
})
