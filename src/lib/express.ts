import express from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export const app = express()
app.use(express.static(join(dirname(fileURLToPath(import.meta.url)), '../public')))
