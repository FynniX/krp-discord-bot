import 'dotenv/config'

export const check = () => {
  if (process.env.DATABASE_URL === undefined) throw new Error('DATABASE_URL is not defined')
  if (process.env.WEBSERVER_URL === undefined) throw new Error('WEBSERVER_URL is not defined')
  if (process.env.WEBSERVER_PORT === undefined) throw new Error('WEBSERVER_PORT is not defined')
  if (process.env.MAX_THREADS === undefined) throw new Error('MAX_THREADS is not defined')
  if (process.env.BOT_TOKEN === undefined) throw new Error('BOT_TOKEN is not defined')
  if (process.env.GUILD_ID === undefined) throw new Error('GUILD_ID is not defined')
  if (process.env.PATREON_ROLE === undefined) throw new Error('PATREON_ROLE is not defined')
}
