import * as mongoose from 'mongoose';
import { VisitStatusType } from '../interfaces/visit.interface';

export const VisitSchema = new mongoose.Schema(
  {
    title: { type: String },
    instruction: { type: String },
    inheritJob: { type: Boolean, required: true, default: false },
    startDate: { type: String, required: true },
    endDate: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    job: { type: mongoose.Types.ObjectId, required: true, ref: 'Jobs' },
    rruleSet: { type: String, required: true },
    excRrule: { type: String },
    team: { type: [mongoose.Types.ObjectId], ref: 'User' },
    lineItems: [
      {
        lineItem: { type: mongoose.Types.ObjectId, required: true, ref: 'LineItem' },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ],
    status: {
      updatedAt: { type: Date, required: true, default: new Date() },
      updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: Object.keys(VisitStatusType), default: 'NOT-COMPLETED' }
    },
    statusRevision: [
      {
        updatedAt: { type: Date, required: true },
        updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: Object.keys(VisitStatusType), default: 'PENDING' }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
