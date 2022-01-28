import { Document } from 'mongoose';
import { ILineItemPricing } from 'src/common/interfaces';
import { User } from 'src/modules/users/interfaces/user.interface';

export interface IInvoice {
  subject: string;
  clientMessage?: string;
  invoiceFor: string | User;
  lineItems: ILineItemPricing[];
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
