import { Document } from 'mongoose';
import { ILineItem } from 'src/modules/line-items/interfaces/line-item.interface';
import { User } from 'src/modules/users/interfaces/user.interface';

export interface IInvoice {
  subject: string;
  clientMessage?: string;
  invoiceFor: string | User;
  lineItems: ILineItem[];
  issued: boolean;
  issuedDate?: string | Date;
  total: number;
  isPaid: boolean;
  paidDate?: Date;
  dueOnReceipt?: boolean;
  dueDuration?: number;
  due?: string | Date;
}

export interface Invoice extends IInvoice, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
