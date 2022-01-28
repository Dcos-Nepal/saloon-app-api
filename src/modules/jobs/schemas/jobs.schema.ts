import * as mongoose from 'mongoose';
import { JobType } from '../interfaces/job.interface';

export const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    jobFor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    remindInvoicing: { type: Boolean, required: true, default: false },
    team: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
    lineItems: [
      {
        name: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ],
    type: { type: String, enum: Object.keys(JobType), required: true, default: JobType['ONE-OFF'] },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
