import { Schema, Types } from 'mongoose';
import { randomStringCaps } from 'src/common/utils/random-string';
import { Customer } from '../interfaces/customer.interface';

export const CustomerSchema: any = new Schema(
  {
    fullName: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    photo: { type: String, required: false },
    address: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    gender: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    email: { type: String, required: false },
    shopId: { type: Types.ObjectId, ref: 'Shop', required: false },
    memberCode: { type: String, required: false, default: null },
    referredBy: { type: String, required: false, default: null },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false }
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
