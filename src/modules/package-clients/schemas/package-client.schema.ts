import { Schema, Types } from 'mongoose';

export const PackageClientSchema: any = new Schema(
  {
    customer: { type: Types.ObjectId, ref: 'Customer', required: false, default: null },
    paymentType: { type: String, default: 'CASH' },
    packagePaidDate: { type: Date, required: true, default: Date.now() },
    noOfSessions: { type: Number, required: true, default: 0 },
    description: { type: String, required: false },

    // Boolean fields
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isApproved: { type: Boolean, default: false },

    // Refrenced fields
    shopId: { type: Types.ObjectId, ref: 'Shop', required: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
