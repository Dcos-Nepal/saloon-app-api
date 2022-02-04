import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { Job } from 'src/modules/jobs/interfaces/job.interface';
import { ILineItemPricing } from 'src/common/interfaces';

export interface IVisit {
  title?: string;
  instruction?: string;
  team?: string[] | User[];
  inheritJob: boolean;
  job: string | Job;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  rruleSet: string;
  excRrule?: string;
  lineItems?: ILineItemPricing[];
  status?: IVisitStatus;
  statusRevision?: IVisitStatus[];
  isPrimary?: boolean;
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
