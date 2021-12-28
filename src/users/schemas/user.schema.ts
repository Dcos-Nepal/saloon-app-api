import * as mongoose from 'mongoose'
import { User } from '../interfaces/user.interface'

export const SettingsSchema = new mongoose.Schema(
  {
    id: String,
    key: String,
    value: String
  },
  { _id: false }
)

export const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    fullName: String,
    email: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v.length === 10,
        message: 'Phone number must be exactly of 10 digits.'
      }
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0.0, 0.0] }
    },
    password: {
      type: String,
      required: function () {
        return this.email
      }
    },
    roles: [{ type: String, required: true }],
    auth: {
      email: {
        valid: { type: Boolean, default: false }
      }
    },
    settings: { type: SettingsSchema, required: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
)

UserSchema.index({ location: '2dsphere' })
UserSchema.pre('save', function (this: User, next) {
  this.fullName = `${this.firstName} ${this.lastName}`
  next()
})
