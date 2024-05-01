import { fork } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export const createGenerator = () => {
  const path = join(dirname(fileURLToPath(import.meta.url)), 'generator.js')
  return fork(path)
}
