import * as mongoose from 'mongoose';

export const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    street1: { type: String, required: true },
    street2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: Number, required: true },
    country: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
