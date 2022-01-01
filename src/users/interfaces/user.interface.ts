import { Document } from 'mongoose'
import { ISetting } from './setting.interface'

export type IUserRole = 'ADMIN' | 'CLIENT' | 'WORKER'

export interface IUserLocation {
  type: string
  coordinates: number[]
}

export interface IUserAddress {
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: number
  country: string
}

export interface IUserDocument {
  documentUrl: string
  type: 'ID-CARD' | 'CLINICAL-CERTIFICATE' | 'POLICE-CERTIFICATE'
}

export interface IUser {
  _id?: string
  firstName: string
  lastName: string
  fullName?: string
  email: string
  phoneNumber: string
  password: string
  roles: IUserRole[]
  address?: IUserAddress
  userDocuments?: [IUserDocument]
  location: IUserLocation
  lastOnline?: Date
  userImage?: string
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
