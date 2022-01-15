import * as mongoose from 'mongoose';
import { IJobStatusType } from '../interfaces/job.interface';

export const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    jobFor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    remindInvoicing: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    status: {
      updatedAt: { type: Date, required: true, default: new Date() },
      updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: Object.keys(IJobStatusType), default: 'PENDING' }
    },
    lineItems: [
      {
        lineItem: { type: mongoose.Types.ObjectId, required: true, ref: 'LineItem' },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ],
    statusRevision: [
      {
        updatedAt: { type: Date, required: true },
        updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: Object.keys(IJobStatusType), default: 'PENDING' }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
