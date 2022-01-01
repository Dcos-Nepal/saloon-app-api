import * as mongoose from 'mongoose';

export enum ConsentType {
  PRIVACY_POLICY = 'Privacy_policy',
  COOKIES_POLICY = 'Cookies_policy',
  TERMS_N_CONDITIONS = 'Terms_and_conditions'
}

export const ConsentRegistrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, enum: ConsentType, required: true },
    content: String,
    isAccepted: Boolean,
    date: Date
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
