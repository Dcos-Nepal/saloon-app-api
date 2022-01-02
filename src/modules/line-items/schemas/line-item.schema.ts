import * as mongoose from 'mongoose';

export const LineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => v.length >= 0,
        message: "Line Item name can't be empty"
      }
    },
    description: { type: String },
    tags: [{ type: String }],
    refCost: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
