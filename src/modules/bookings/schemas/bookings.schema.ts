import { Schema, Types } from 'mongoose';
import { AppointmentType } from 'src/modules/appointments/schemas/appointment.schema';
import { BookingStatusType } from '../interfaces/booking.interface';

export const BookingSchema: any = new Schema(
  {
    customer: { type: Types.ObjectId, ref: 'Customer', required: false, default: null },
    fullName: { type: String, required: false, default: '' },
    phoneNumber: { type: String, required: false, default: '' },
    address: { type: String, required: false, default: '' },
    bookingDate: { type: Date, required: true },
    type: {
      type: String,
      enum: AppointmentType,
      default: AppointmentType.CONSULATION
    },
    status: {
      updatedAt: { type: Date, required: true, default: new Date() },
      updatedBy: { type: Types.ObjectId, ref: 'User' },
      status: { type: String, enum: Object.keys(BookingStatusType), default: 'BOOKED' },
      reason: { type: String, required: false, default: ''}
    },
    statusHistory: [
      {
        updatedAt: { type: Date, required: true },
        updatedBy: { type: Types.ObjectId, ref: 'User' },
        status: { type: String, enum: Object.keys(BookingStatusType), default: 'PENDING' },
        reason: { type: String, required: false, default: ''}
      }
    ],
    description: { type: String, required: false },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
