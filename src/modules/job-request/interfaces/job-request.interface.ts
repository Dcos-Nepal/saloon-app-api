import { Document } from 'mongoose';

export interface IJobRequest {
  _id?: string;
  reqCode?: string;
  name: string;
  description: string;
  type?: string;
  client: string;
  property?: string;
  workingDays?: [string];
  workingHours?: {
    start: string;
    end: string;
  };
  status?: string;
  isDeleted?: boolean;
  createdBy?: string;
}

export enum JobRequestStatus {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  ACCEPTED = 'ACCEPTED'
}

export interface JobRequest extends IJobRequest, Document {
  _id?: string;
}
