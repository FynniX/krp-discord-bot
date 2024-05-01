// rollup.generator.config.js
import typescript from '@rollup/plugin-typescript'
import eslint from '@rollup/plugin-eslint'

export default {
  input: 'src/generator.ts',
  external: ['fs', 'path', 'url', 'child_process', 'adm-zip', '@prisma/client'],
  output: {
    file: 'dist/generator.js',
    format: 'es'
  },
  plugins: [typescript(), eslint()]
}
