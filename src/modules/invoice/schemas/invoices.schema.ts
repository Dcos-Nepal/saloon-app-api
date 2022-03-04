import * as mongoose from 'mongoose';
import { randomNumbers } from 'src/common/utils/random-string';
import { Invoice } from '../interfaces/invoice.interface';

export const InvoiceSchema = new mongoose.Schema(
  {
    refCode: { type: String, required: true },
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

/**
 * Validates Schema before saving document
 */
InvoiceSchema.pre('validate', function (this: Invoice, next) {
  this.refCode = `INVOICE:${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}-${randomNumbers()}`;
  next();
});

/**
 * Before saving new Invoice
 */
InvoiceSchema.pre('save', function (this: Invoice, next) {
  // Write some functionality here
  next();
});
