// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import eslint from '@rollup/plugin-eslint'

export default {
  input: 'src/index.ts',
  external: ['path', 'url', 'dotenv/config', 'express', '@prisma/client', 'discordx', 'discord.js'],
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [typescript(), eslint()]
}
