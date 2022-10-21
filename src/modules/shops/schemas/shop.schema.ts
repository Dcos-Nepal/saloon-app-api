import { Schema } from 'mongoose';

export const ShopSchema: any = new Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => v.length >= 0,
        message: "Shop name can't be empty"
      }
    },
    logo: { type: String },
    address: { type: String },
    description: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
