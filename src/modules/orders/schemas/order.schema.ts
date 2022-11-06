import { Schema, Types } from 'mongoose';

export enum OrderStatuses {
  ORDER_PENDING = 'ORDER_PENDING',
  NOT_ON_STOCK = 'NOT_ON_STOCK',
  NOT_PACKED = 'NOT_PACKED',
  NOT_DELIVERED = 'NOT_DELIVERED',
  PACKED = 'PACKED',
  DELIVERED = 'DELIVERED'
}

const OrderProduct: any = new Schema({
  name: { type: String, default: '' },
  description: { type: String },
  unitPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  notes: { type: String, default: '' }
});

const StatusSchema: any = new Schema({
  name: {
    type: String,
    enum: OrderStatuses,
    default: OrderStatuses.ORDER_PENDING
  },
  reason: { type: String, default: '' },
  date: { type: Date, default: new Date() }
});

export const OrderSchema: any = new Schema(
  {
    title: { type: String, default: ''},
    customer: { type: Types.ObjectId, ref: 'Customer' },
    status: {
      type: StatusSchema,
      required: true,
      default: {
        reason: '',
        name: OrderStatuses.ORDER_PENDING,
        date: new Date().toISOString()
      }
    },
    products: [{ type: OrderProduct }],
    prevStatus: [{ type: StatusSchema }],
    notes: { type: String, default: '' },
    orderDate: { type: String, default: new Date() },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
