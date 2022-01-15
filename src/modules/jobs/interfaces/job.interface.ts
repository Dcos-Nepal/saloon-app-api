import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { LineItem } from 'src/modules/line-items/interfaces/line-item.interface';

export interface IJob {
  title: string;
  instruction: string;
  jobFor: string | User;
  remindInvoicing: boolean;
  status?: IJobStatus;
  statusRevision?: IJobStatus[];
  type: JobType;
  team?: string[] | User[];
  createdBy: string | User;
  lineItems: {
    lineItem: string | LineItem;
    quantity: number;
    unitPrice: number;
  }[];
}

export enum JobType {
  'ONE-OFF' = 'ONE-OFF',
  'RECURRING' = 'RECURRING'
}

export interface IJobStatus {
  updatedAt: Date;
  status: IJobStatusType;
  updatedBy: string | User;
}

export enum IJobStatusType {
  'PENDING' = 'PENDING',
  'IN-PROGRESS' = 'IN-PROGRESS',
  'COMPLETED' = 'COMPLETED'
}

export interface Job extends IJob, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
