import * as mongoose from 'mongoose';

export enum DeviceType {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID'
}

export const UserDevicesSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    deviceToken: { type: String },
    subscription: { type: String },
    deviceType: { type: String, enum: DeviceType, required: true, default: DeviceType.WEB },
    timestamp: { type: Date }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
