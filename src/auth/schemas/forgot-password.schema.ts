import * as mongoose from 'mongoose';

export const ForgotPasswordSchema = new mongoose.Schema({
  email: String,
  newPasswordToken: String,
  timestamp: Date,
},
{
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
});
