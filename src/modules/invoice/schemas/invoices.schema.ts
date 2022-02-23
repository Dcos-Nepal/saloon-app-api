import * as mongoose from 'mongoose';

export const InvoiceSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    message: { type: String },
    issued: { type: Boolean, required: true, default: false },
    issuedDate: { type: Date },
    isPaid: { type: Boolean, required: true, default: false },
    paidDate: { type: Date },
    total: { type: Number, required: true },
    refJob: { type: mongoose.Types.ObjectId, required: false, ref: 'Job', default: null },
    refVisit: { type: mongoose.Types.ObjectId, required: false, ref: 'Visit', default: null },
    invoiceFor: { type: mongoose.Types.ObjectId, ref: 'User' },
    dueOnReceipt: { type: Boolean, required: true, default: false },
    dueDuration: { type: Number },
    due: { type: Date },
    lineItems: [
      {
        ref: { type: String, required: false },
        name: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
