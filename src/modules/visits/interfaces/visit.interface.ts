import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { LineItem } from 'src/modules/line-items/interfaces/line-item.interface';
import { Job } from 'src/modules/jobs/interfaces/job.interface';

export interface IVisit {
  title?: string;
  instruction?: string;
  team?: string[] | User[];
  inheritJob: boolean;
  job: string | Job;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  rruleSet: string;
  excRrule?: string;
  lineItems?: {
    lineItem: string | LineItem;
    quantity: number;
    unitPrice: number;
  }[];
  status?: IVisitStatus;
  statusRevision?: IVisitStatus[];
}

export interface IVisitStatus {
  updatedAt: Date;
  status: VisitStatusType;
  updatedBy: string | User;
}

export enum VisitStatusType {
  'NOT-COMPLETED' = 'NOT-COMPLETED',
  'COMPLETED' = 'COMPLETED'
}

export interface Visit extends IVisit, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
