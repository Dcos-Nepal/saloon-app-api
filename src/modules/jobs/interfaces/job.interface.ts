import { Document } from 'mongoose';
import { User } from 'src/modules/users/interfaces/user.interface';
import { ILineItemPricing } from 'src/common/interfaces';
import { Visit } from 'src/modules/visits/interfaces/visit.interface';
import { Property } from 'src/modules/properties/interfaces/property.interface';

export interface IJob {
  _id?: string;
  refCode?: string;
  jobType?: string;
  title: string;
  instruction: string;
  jobFor: string | User;
  property?: string | Property;
  remindInvoicing?: boolean;
  startDate?: Date;
  type: JobType;
  team?: string[] | User[];
  createdBy: string | User;
  lineItems?: ILineItemPricing[];
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
  primaryVisit?: string | Visit;
  isCompleted?: boolean;
  isDeleted?: boolean;
  notes?: string;
  docs?: [{ key: string; url: string }];
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
