import { client } from '../lib/discord.js'

export const getGuild = async () => {
  if (!client.isReady()) return
  return await client.guilds.fetch(process.env.GUILD_ID as string)
}

export const getMembers = async () => {
  if (!client.isReady()) return
  const guild = await client.guilds.fetch(process.env.GUILD_ID as string)
  return await guild?.members.fetch()
}
