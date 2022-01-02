import * as mongoose from 'mongoose';
import { User } from '../interfaces/user.interface';

export const SettingsSchema = new mongoose.Schema(
  {
    id: String,
    key: String,
    value: String
  },
  { _id: false }
);

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
        validator: (v: string) => v.length === 10,
        message: 'Phone number must be exactly of 10 digits.'
      }
    },
    address: {
      type: {
        street1: { type: String, required: true },
        street2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: Number, required: true },
        country: { type: String, required: true }
      }
    },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0.0, 0.0] }
    },
    userDocuments: [
      {
        documentUrl: { type: String },
        type: { type: String, enum: ['ID-CARD', 'CLINICAL-CERTIFICATE', 'POLICE-CERTIFICATE'] }
      }
    ],
    userImage: { type: String },
    password: {
      type: String,
      required: function () {
        return this.email;
      }
    },
    roles: [{ type: String, required: true }],
    lastOnline: { type: Date },
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
);

UserSchema.index({ location: '2dsphere' });
UserSchema.pre('save', function (this: User, next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});
UserSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this.set('fullName', `${this.getUpdate()['firstName'] || docToUpdate.firstName} ${this.getUpdate()['lastName'] || docToUpdate.lastName}`);
  next();
});
