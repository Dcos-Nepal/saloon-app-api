import { Schema, Types } from 'mongoose';

export const ServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => v.length >= 0,
        message: "Service name can't be empty"
      }
    },
    description: { type: String },

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
