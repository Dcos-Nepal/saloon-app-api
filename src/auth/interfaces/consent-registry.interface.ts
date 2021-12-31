import { Document, Types } from 'mongoose'
import { ConsentType } from '../schemas/consent-registry.schema'

export interface ConsentRegistry extends Document {
  user: Types.ObjectId
  type: ConsentType
  content: string
  isAccepted: boolean
  date: Date
}
