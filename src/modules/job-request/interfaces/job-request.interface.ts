import { Document } from 'mongoose';

export interface IJobRequest {
  _id?: string;
  name: string;
  description: string;
  type?: string;
  client: string;
  status: string;
}

export interface JobRequest extends IJobRequest, Document {
  _id?: string;
}
