import { Document } from 'mongoose';

export interface IUserDevice {
  _id?: string;
  user: string;
  deviceToken: string;
  deviceType: string;
  timestamp?: Date;
}

export interface UserDevice extends IUserDevice, Document {
  _id?: string;
}
