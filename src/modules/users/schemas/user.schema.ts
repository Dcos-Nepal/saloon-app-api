import * as mongoose from 'mongoose';
import { randomStringCaps } from 'src/common/utils/random-string';
import { User } from '../interfaces/user.interface';

export enum UserType {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  WORKER = 'WORKER',
  MANAGER = 'MANAGER'
}

export const SettingsSchema = new mongoose.Schema(
  {
    id: String,
    key: String,
    value: String
  },
  { _id: false }
);

export const StaffSchema = new mongoose.Schema({}, { _id: false });

export const ClientSchema = new mongoose.Schema(
  {
    company: { type: String },
    preferredTime: [{ type: String }]
  },
  { _id: false }
);

export const WorkerSchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0.0, 0.0] }
  },
  documents: {
    idCard: {
      url: { type: String },
      key: { type: String },
      type: { type: String, enum: ['ID_CARD'] }
    },
    cleaningCert: {
      url: { type: String },
      key: { type: String },
      type: { type: String, enum: ['CLEANING_CERTIFICATE'] }
    },
    policeCert: {
      url: { type: String },
      key: { type: String },
      type: { type: String, enum: ['POLICE_CERTIFICATE'] }
    }
  },
  workingDays: [{ type: String }],
  workingHours: { type: String },
  services: [{ type: String }]
});

export const UserDataSchema = new mongoose.Schema(
  {
    referralCode: { type: String, required: true, default: 'OC-00000' },
    referredBy: { type: mongoose.Types.ObjectId, required: false, ref: 'User', default: null }
  },
  {
    _id: false,
    discriminatorKey: 'type',
    toJSON: { getters: true }
  }
);

export const UserSchema = new mongoose.Schema(
  {
    userCode: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String },
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
    avatar: {
      key: { type: String },
      url: { type: String }
    },
    password: {
      type: String,
      required: function () {
        return this.email;
      }
    },
    auth: {
      email: {
        valid: { type: Boolean, default: false }
      }
    },
    roles: [{ type: String, required: true }],
    settings: { type: SettingsSchema, required: false },
    userData: UserDataSchema,
    lastOnline: { type: Date },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Indexing
WorkerSchema.index({ location: '2dsphere' });

/**
 * Before saving new User
 */
UserSchema.pre('save', function (this: User, next) {
  this.userCode = `OCU-${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}-${randomStringCaps()}`;
  this.fullName = `${this.firstName} ${this.lastName}`;

  if (this.roles.includes('CLIENT') || this.roles.includes('WORKER')) {
    this.userData = this.userData ? this.userData : {};
    this.userData.type = this.roles.includes('CLIENT') ? 'CLIENT' : 'WORKER';
    this.userData.referralCode = `OC-${randomStringCaps()}`;
  }
  next();
});

/**
 * Before finding and updating the User
 */
UserSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this.set('fullName', `${this.getUpdate()['firstName'] || docToUpdate.firstName} ${this.getUpdate()['lastName'] || docToUpdate.lastName}`);
  next();
});

// Schema Discrimination
(UserSchema.path('userData') as mongoose.Schema.Types.DocumentArray).discriminator(UserType.CLIENT, ClientSchema);
(UserSchema.path('userData') as mongoose.Schema.Types.DocumentArray).discriminator(UserType.WORKER, WorkerSchema);
