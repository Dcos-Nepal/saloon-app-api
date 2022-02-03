import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { ILineItemPricing } from 'src/common/interfaces';
import { Visit } from 'src/modules/visits/interfaces/visit.interface';

export interface IJob {
  title: string;
  instruction: string;
  jobFor: string | User;
  remindInvoicing?: boolean;
  startDate?: Date;
  type: JobType;
  team?: string[] | User[];
  createdBy: string | User;
  lineItems?: ILineItemPricing[];
  primaryVisit?: string | Visit;
  isCompleted?: boolean;
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
