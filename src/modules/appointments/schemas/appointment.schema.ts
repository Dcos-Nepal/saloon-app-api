import { Schema, Types } from 'mongoose';

export enum AppointmentType {
  'TREATMENT' = 'TREATMENT',
  'CONSULTATION' = 'CONSULTATION',
  'MAINTAINANCE' = 'MAINTAINANCE',
  'FOLLOW UP' = 'FOLLOW UP'
}

export enum AppointmentStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

const StatusSchema: any = new Schema({
  name: {
    type: String,
    enum: AppointmentStatus,
    default: AppointmentStatus.WAITING
  },
  date: { type: Date, default: new Date() },
  duration: { type: String, default: '' },
  reason: { type: String, default: '' }
});

export const AppointmentSchema: any = new Schema(
  {
    customer: { type: Types.ObjectId, ref: 'Customer' },
    appointmentDate: { type: String, default: '' },
    appointmentTime: { type: String, default: '' },
    notes: { type: String, default: '' },
    services: [{ type: String, default: '' }],
    type: {
      type: String,
      enum: AppointmentType,
      default: AppointmentType.CONSULTATION
    },
    status: {
      type: StatusSchema,
      required: true,
      default: {
        name: AppointmentStatus.WAITING,
        date: new Date().toISOString(),
        duration: '',
        reason: ''
      }
    },
    history: [{ type: StatusSchema }],
    interval: { type: String, default: 'Regular' },
    session: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdDate: [{ type: String, default: new Date() }]
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
