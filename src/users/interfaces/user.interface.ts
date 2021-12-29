import { Document } from 'mongoose'
import { ISetting } from './setting.interface'

export type IUserRole = 'ADMIN' | 'CLIENT' | 'WORKER'

export interface IUser {
  _id?: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  password: string
  roles: IUserRole[]
  auth: {
    email: {
      valid: boolean
    }
  }
  settings: ISetting
}

export interface User extends IUser, Document {
  _id?: string
}
