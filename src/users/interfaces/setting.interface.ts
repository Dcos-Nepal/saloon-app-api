import { Document } from 'mongoose'

export interface ISetting {
  key: string
  value: string
}
export interface Setting extends ISetting, Document {}
