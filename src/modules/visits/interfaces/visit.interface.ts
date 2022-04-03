import { Document } from 'mongoose';
import { ILineItemPricing } from 'src/common/interfaces';
import { User } from 'src/modules/users/interfaces/user.interface';
import { Job } from 'src/modules/jobs/interfaces/job.interface';

export interface IVisit {
  _id?: any;
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
  excRrule?: string[];
  lineItems?: ILineItemPricing[];
  status?: IVisitStatus;
  statusRevision?: IVisitStatus[];
  isPrimary?: boolean;
  hasMultiVisit: boolean;
  visitFor: string | User;
  completion?: {
    note: string;
    docs?: [{ key: string; url: string }];
    date: Date;
    completedBy: string | User;
  };
  feedback?: {
    note?: string;
    rating: number;
    date?: Date;
  };
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
