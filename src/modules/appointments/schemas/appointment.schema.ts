import { Schema, Types } from 'mongoose';

export enum AppointmentType {
  TREATMENT = 'TREATMENT',
  CONSULTATION = 'CONSULTATION',
  MAINTAINANCE = 'MAINTAINANCE',
  'FOLLOW UP' = 'FOLLOW UP'
}

export enum AppointmentStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

const StatusSchema: any = new Schema({
  name: {
    type: String,
    enum: AppointmentStatus,
    default: AppointmentStatus.WAITING,
  },
  date: { type: Date, default: new Date() },
  duration: { type: String, default: ''}
});

export const AppointmentSchema: any = new Schema(
  {
    customer: { type: Types.ObjectId, ref: 'Customer' },
    appointmentDate: { type: String, default: '' },
    appointmentTime: { type: String, default: '' },
    notes: { type: String, default: '' },
    services: [{ type: String, default: ''}],
    type: {
      type: String,
      enum : AppointmentType,
      default: AppointmentType.CONSULTATION
    },
    status: { type: StatusSchema, required: true, default: {
      name: AppointmentStatus.WAITING,
      date: new Date(),
      duration: ''
    }},
    history: [{ type: StatusSchema }],
    interval: { type: String, default: 'Regular'},
    session: { type: String, default: '0'},
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
