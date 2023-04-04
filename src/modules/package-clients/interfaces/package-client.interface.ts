import { Document } from 'mongoose';

export interface IPackageClient {
  _id?: any;
  customer: string | { _id: string; fullName: string; phoneNumber: string };
  paymentType: 'CASH' | 'CHEQUE' | 'ONLINE';
  packagePaidDate: string;
  noOfSessions: number;
  isApproved: boolean;
  shopId?: string;
  description?: string;
  isDeleted?: boolean;
}

export interface PackageClient extends IPackageClient, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
