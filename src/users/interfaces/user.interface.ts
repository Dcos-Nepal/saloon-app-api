import { Document, ObjectId } from 'mongoose';
import { Setting } from './setting.interface';

export interface User extends Document{
  _id?: string | ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: string[];
  auth: {
    email : {
      valid : boolean,
    }
  },
  settings: Setting,
}
