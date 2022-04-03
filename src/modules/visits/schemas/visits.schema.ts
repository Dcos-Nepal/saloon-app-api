import * as mongoose from 'mongoose';
import { VisitStatusType } from '../interfaces/visit.interface';

export const VisitSchema = new mongoose.Schema(
  {
    title: { type: String },
    instruction: { type: String },
    inheritJob: { type: Boolean, required: true, default: false },
    hasMultiVisit: { type: Boolean, required: true, default: true },
    isPrimary: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    rruleSet: { type: String, required: true },
    excRrule: [{ type: String }],
    job: { type: mongoose.Types.ObjectId, required: true, ref: 'Jobs' },
    visitFor: { type: mongoose.Types.ObjectId, required: true, ref: 'Users' },
    team: { type: [mongoose.Types.ObjectId], ref: 'User' },
    completion: {
      note: { type: String },
      docs: [
        {
          url: { type: String },
          key: { type: String }
        }
      ],
      date: { type: Date },
      completedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
    },
    feedback: {
      note: { type: String },
      rating: { type: Number },
      date: { type: Date }
    },
    lineItems: [
      {
        ref: { type: String, required: false },
        name: { type: String, required: true },
        description: { type: String },
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
