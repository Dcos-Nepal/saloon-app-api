import { Document } from 'mongoose';
import { Job } from 'src/modules/jobs/interfaces/job.interface';
import { ILineItem } from 'src/modules/line-items/interfaces/line-item.interface';
import { User } from 'src/modules/users/interfaces/user.interface';
import { Visit } from 'src/modules/visits/interfaces/visit.interface';

export interface IInvoice {
  refCode?: string;
  subject: string;
  message?: string;
  invoiceFor: string | User;
  refJob?: string | Job;
  refVisit?: string | Visit;
  lineItems: ILineItem[];
  issued?: boolean;
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
