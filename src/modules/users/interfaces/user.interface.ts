import { Document } from 'mongoose';
import { IBaseAddress } from 'src/common/interfaces';
import { ISetting } from './setting.interface';

export type IUserRole = 'ADMIN' | 'CLIENT' | 'WORKER';

export interface IUserLocation {
  type: string;
  coordinates: number[];
}

export interface IUserDocument {
  idCard?: {
    url: string;
    key: string;
    type: 'ID_CARD';
  };
  cleaningCert?: {
    url: string;
    key: string;
    type: 'CLEANING_CERTIFICATE';
  };
  policeCert?: {
    url: string;
    key: string;
    type: 'POLICE_CERTIFICATE';
  };
}

export interface IClient {
  type?: string;
  referredBy?: string;
  referralCode?: string;
  preferredTime?: [string];
  company?: string;
}

export interface IWorker {
  type?: string;
  location?: IUserLocation;
  documents?: IUserDocument;
  workingDays?: [string];
  workingHOurs?: string;
  referredBy?: string;
  referralCode?: string;
}

export interface IUser {
  _id?: string;
  userCode?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: IUserRole[];
  address?: IBaseAddress;
  avatar?: {
    key: string;
    url: string;
  };
  auth?: {
    email: {
      valid: boolean;
    };
  };
  isDeleted?: boolean;
  userData: IClient | IWorker;
  settings?: ISetting;
  lastOnline?: Date;
}

export interface User extends IUser, Document {
  _id?: string;
}
