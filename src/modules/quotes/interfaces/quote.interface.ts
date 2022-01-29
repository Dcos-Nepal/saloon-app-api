import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { JobRequest } from 'src/modules/job-request/interfaces/job-request.interface';
import { ILineItemPricing } from 'src/common/interfaces';

export interface IQuote {
  title: string;
  description: string;
  status?: IQuoteStatus;
  quoteFor: string | User;
  createdBy: string | User;
  lineItems: ILineItemPricing[];
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
