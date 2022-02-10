import * as mongoose from 'mongoose';
import { IQuoteStatusType } from '../interfaces/quote.interface';

export const QuotesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    quoteFor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    property: { type: mongoose.Types.ObjectId, required: true, ref: 'Property' },
    jobRequest: { type: mongoose.Types.ObjectId, required: false, ref: 'JobRequest', default: null },
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
      reason: { type: String, required: false },
      status: { type: String, enum: Object.keys(IQuoteStatusType), default: 'PENDING' }
    },
    statusRevision: [
      {
        updatedAt: { type: Date, required: true, default: new Date() },
        updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: false },
        status: { type: String, enum: Object.keys(IQuoteStatusType), default: 'PENDING' }
      }
    ],
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
