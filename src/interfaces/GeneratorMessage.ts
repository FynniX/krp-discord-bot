import { ProcessMessage } from '../enums/ProcessMessage.js'

export interface GeneratorMessage {
  type: ProcessMessage
  memberId?: number
  modId?: number
  progress?: number
  success?: boolean
  filename?: string
  message?: string
}
