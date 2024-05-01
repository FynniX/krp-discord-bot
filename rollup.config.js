// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import eslint from '@rollup/plugin-eslint'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [typescript(), eslint()]
}
