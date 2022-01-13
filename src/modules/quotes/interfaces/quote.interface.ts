import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { LineItem } from 'src/modules/line-items/interfaces/line-item.interface';
import { JobRequest } from 'src/modules/job-request/interfaces/job-request.interface';

export interface IQuote {
  title: string;
  description: string;
  status?: IQuoteStatus;
  quoteFor: string | User;
  createdBy: string | User;
  lineItems: {
    lineItem: string | LineItem;
    quantity: number;
    unitPrice: number;
  }[];
  jobRequest: string | JobRequest;
  statusRevision?: IQuoteStatus[];
}

export interface IQuoteStatus {
  updatedAt: Date;
  status: IQuoteStatusType;
  updatedBy: string | User;
}

export enum IQuoteStatusType {
  'PENDING' = 'PENDING',
  'ACCEPTED' = 'ACCEPTED',
  'REJECTED' = 'REJECTED'
}

export interface Quote extends IQuote, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
