import { Document } from 'mongoose';
import { IBaseAddress } from 'src/common/interfaces';
import { ISetting } from './setting.interface';

export type IUserRole = 'ADMIN' | 'CLIENT' | 'WORKER';

export interface IUserLocation {
  type: string;
  coordinates: number[];
}

export interface IUserDocument {
  documentUrl: string;
  type: 'ID-CARD' | 'CLINICAL-CERTIFICATE' | 'POLICE-CERTIFICATE';
}

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: IUserRole[];
  address?: IBaseAddress;
  userDocuments?: [IUserDocument];
  location: IUserLocation;
  lastOnline?: Date;
  userImage?: {
    key: string;
    url: string;
  };
  auth: {
    email: {
      valid: boolean;
    };
  };
  settings: ISetting;
  referralCode: string;
  referredBy: User;
}

export interface User extends IUser, Document {
  _id?: string;
}
