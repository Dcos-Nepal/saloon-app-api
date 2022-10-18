import { Schema, Types } from 'mongoose';

export enum AppointmentType {
  SERVICE = 'SERVICE',
  CONSULTATION = 'CONSULTATION'
}

export enum AppointmentStatus {
  WAITING = 'WAITING',
  ON_GOING = 'ON_GOING',
  COMPLETED = 'COMPLETED'
}

export const AppointmentSchema = new Schema(
  {
    customer: { type: Types.ObjectId, ref: 'Customer', required: false },
    dateTime: { type: Date, required: true },
    notes: { type: String, required: false },
    type: { type: String, required: true, default: AppointmentType.CONSULTATION },
    status: { type: String, required: true, default: AppointmentStatus.WAITING },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
