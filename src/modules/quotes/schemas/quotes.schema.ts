import * as mongoose from 'mongoose';
import { IQuoteStatusType } from '../interfaces/quote.interface';

export const QuotesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    quoteFor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    status: {
      updatedAt: { type: Date, required: true, default: new Date() },
      updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: Object.keys(IQuoteStatusType), default: 'PENDING' }
    },
    jobRequest: { type: mongoose.Types.ObjectId, required: true, ref: 'JobRequest' },
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
        status: { type: String, enum: Object.keys(IQuoteStatusType), default: 'PENDING' }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
