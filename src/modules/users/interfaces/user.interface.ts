import { Document } from 'mongoose';

export type IUserRole = 'SUPER_ADMIN' | 'SHOP_ADMIN' | 'RECEPTIONIST' | 'CONSULTANT' | 'CUSTOMER';

export interface IUser {
  _id?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  memberCode: string;
  roles: IUserRole[];
  shopId?: string;
  isDeleted?: boolean;
  isActive?: boolean;
  createdBy?: string;
}

export interface User extends IUser, Document {
  _id?: string;
}
