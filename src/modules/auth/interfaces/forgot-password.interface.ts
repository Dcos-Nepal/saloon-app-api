import { Document } from 'mongoose';

export interface ForgotPassword extends Document {
  email: string;
  passwordToken: string;
  timestamp: Date;
}
