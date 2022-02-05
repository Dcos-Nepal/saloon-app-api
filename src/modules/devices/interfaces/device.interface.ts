import { Document } from 'mongoose';

// export interface DeviceType {
//   web: string;
//   ios: string;
//   android: string;
// }

export interface IUserDevice {
  _id?: string;
  user: string;
  deviceToken: string;
  deviceType: string;
  subscription?: string;
  timestamp?: Date;
}

export interface UserDevice extends IUserDevice, Document {
  _id?: string;
}
