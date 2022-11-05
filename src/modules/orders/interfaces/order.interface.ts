import { OrderStatuses } from '../schemas/order.schema';

export interface OrderStatus {
  name: OrderStatuses;
  date: Date;
  reason?: string;
}

export interface OrderProduct {
  product: any;
  rate: number;
  quantitiy: number;
  notes: string;
}

export interface IOrder {
  _id?: string;
  customer: string;
  orderNotes: string;
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
