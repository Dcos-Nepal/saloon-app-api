import { Schema, Types } from 'mongoose';
import { randomStringCaps } from 'src/common/utils/random-string';
import { Customer } from '../interfaces/customer.interface';

export enum PhotoType {
  FRONT = 'FRONT',
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
  BACK = 'BACK',
  NORMAL = 'NORMAL'
}

export enum CustomerTagTypes {
  'VIP' = 'VIP',
  'MONTHLY' = 'MONTHLY',
  'REGULAR' = 'REGULAR',
  '15 DAYS' = '15 DAYS'
}

const PhotoSchema: any = new Schema({
  photo: { type: String, default: '' },
  caption: { type: String, default: '' },
  type: { type: String, enum: PhotoType, default: PhotoType.NORMAL },
  date: { type: Date, default: new Date() }
});

export const CustomerSchema: any = new Schema(
  {
    // Auto generated fields
    fullName: { type: String, default: '' },
    memberCode: { type: String, required: false, default: null },

    // Fillable fields
    firstName: { type: String, default: '' },
    lastName: { type: String, rdefault: '' },
    photo: { type: String, default: '' },
    address: { type: String, required: false },
    phoneNumber: { type: String, default: '' },
    gender: { type: String, required: false },
    dateOfBirth: { type: Date, required: true },
    email: { type: String, required: false },
    referredBy: { type: String, default: '' },
    notes: { type: String, default: '' },
    photos: [{ type: PhotoSchema, required: false }],
    tags: [{ type: String, enum: CustomerTagTypes, required: true, default: '' }],

    // Boolean fields
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },

    // Refrenced fields
    shopId: { type: Types.ObjectId, ref: 'Shop', required: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

/**
 * Before saving new User
 */
CustomerSchema.pre('save', function (this: Customer, next) {
  this.fullName = `${this.firstName} ${this.lastName}`;
  this.memberCode = `CUS-${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}-${randomStringCaps()}`;
  next();
});

/**
 * Before finding and updating the User
 */
CustomerSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this.set('fullName', `${this.getUpdate()['firstName'] || docToUpdate.firstName} ${this.getUpdate()['lastName'] || docToUpdate.lastName}`);
  next();
});
