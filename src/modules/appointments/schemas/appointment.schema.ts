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

export const AppointmentSchema: any = new Schema(
  {
    customer: { type: Types.ObjectId, ref: 'Customer', required: false },
    dateTime: { type: Date, required: true },
    notes: { type: String, required: false },
    services: [{ type: String, required: false }],
    type: { type: String, required: true, default: AppointmentType.CONSULTATION },
    status: { type: String, required: true, default: AppointmentStatus.WAITING },
    interval: { type: String, required: true, default: 'Regular'},
    session: { type: String, required: true, default: '0'},
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false }

    // Regular
    // Monthly
    // In 15 Days
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
