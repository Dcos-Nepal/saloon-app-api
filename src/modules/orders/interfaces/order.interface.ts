import { OrderStatuses } from '../schemas/order.schema';

export interface OrderStatus {
  name: OrderStatuses;
  date: Date;
  reason?: string;
}

export interface OrderProduct {
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
  notes: string;
}

export interface IOrder {
  _id?: string;
  title: string;
  customer: string;
  notes: string;
  status: OrderStatus;
  prevStatus?: OrderStatus[];
  products?: OrderProduct[];
  orderDate?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Order extends IOrder, Document {
  _id?: string;
}
