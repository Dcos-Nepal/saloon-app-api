import { Document } from 'mongoose';

export interface EmailVerification extends Document {
  _id?: boolean;
  email: string;
  emailToken: string;
  timestamp: Date;
}
