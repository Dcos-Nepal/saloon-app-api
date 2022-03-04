import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { JobRequest } from 'src/modules/job-request/interfaces/job-request.interface';
import { ILineItemPricing } from 'src/common/interfaces';
import { Property } from 'src/modules/properties/interfaces/property.interface';

export interface IQuote {
  refCode?: string;
  title: string;
  description: string;
  status?: IQuoteStatus;
  quoteFor: string | User;
  createdBy: string | User;
  property: string | Property;
  lineItems: ILineItemPricing[];
  jobRequest: string | JobRequest;
  statusRevision?: IQuoteStatus[];
  isDeleted?: boolean;
}

export interface IQuoteStatus {
  updatedAt: Date;
  status: IQuoteStatusType;
  updatedBy: string | User;
  reason?: string;
}

export enum IQuoteStatusType {
  'PENDING' = 'PENDING',
  'ACCEPTED' = 'ACCEPTED',
  'REJECTED' = 'REJECTED',
  'ARCHIVED' = 'ARCHIVED',
  'CHANGE_REQUESTED' = 'CHANGE_REQUESTED'
}

export interface Quote extends IQuote, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
