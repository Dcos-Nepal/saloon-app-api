import { Document } from 'mongoose';

export interface Setting extends Document{
  key: string;
  value: string;
}
