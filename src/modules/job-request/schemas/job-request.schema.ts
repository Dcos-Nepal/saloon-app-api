import * as mongoose from 'mongoose';

export const JobRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    type: { type: String },
    status: { type: String, default: 'PENDING' },
    client: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
