import { Schema, Types } from 'mongoose';

export const CustomerSchema = new Schema(
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
