import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { ILineItemPricing } from 'src/common/interfaces';

export interface IJob {
  title: string;
  instruction: string;
  jobFor: string | User;
  remindInvoicing?: boolean;
  type: JobType;
  team?: string[] | User[];
  createdBy: string | User;
  lineItems?: ILineItemPricing[];
}

export enum JobType {
  'ONE-OFF' = 'ONE-OFF',
  'RECURRING' = 'RECURRING'
}

export interface Job extends IJob, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
