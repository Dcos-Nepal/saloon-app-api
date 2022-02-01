import * as mongoose from 'mongoose';
import { IQuoteStatusType } from '../interfaces/quote.interface';

export const QuotesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    quoteFor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    jobRequest: { type: mongoose.Types.ObjectId, required: false, ref: 'JobRequest', default: null },
    lineItems: [
      {
        name: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ],
    status: {
      updatedAt: { type: Date, required: true, default: new Date() },
      updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: Object.keys(IQuoteStatusType), default: 'PENDING' }
    },
    statusRevision: [
      {
        updatedAt: { type: Date, required: true, default: new Date() },
        updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: Object.keys(IQuoteStatusType), default: 'PENDING' }
      }
    ],
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
