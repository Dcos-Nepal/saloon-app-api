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
  name: { type: Types.ObjectId, ref: 'Product' },
  rate: { type: Number, default: new Date() },
  quantity: { type: Number, default: new Date() },
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
    orderNotes: { type: String, default: '' },
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
