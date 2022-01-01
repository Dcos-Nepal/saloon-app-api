import { Document } from 'mongoose';

export interface ForgotPassword extends Document {
  email: string;
  newPasswordToken: string;
  timestamp: Date;
}
