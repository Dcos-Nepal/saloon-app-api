import { Document } from 'mongoose';
import { IBaseAddress } from 'src/common/interfaces';

export interface IProperty extends IBaseAddress {
  _id?: string;
  name: string;
  user: string;
}

export interface Property extends IProperty, Document {
  _id?: string;
}
