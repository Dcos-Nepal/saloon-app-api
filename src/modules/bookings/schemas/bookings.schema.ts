import { Schema, Types } from 'mongoose';
import { AppointmentType } from 'src/modules/appointments/schemas/appointment.schema';
import { BookingStatusType } from '../interfaces/booking.interface';

export const BookingSchema: any = new Schema(
  {
    fullName: { type: String },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    type: {
      type: String,
      enum: AppointmentType,
      default: AppointmentType.CONSULTATION
    },
    status: {
      updatedAt: { type: Date, required: true, default: new Date() },
      updatedBy: { type: Types.ObjectId, ref: 'User' },
      status: { type: String, enum: Object.keys(BookingStatusType), default: 'BOOKED' }
    },
    statusHistory: [
      {
        updatedAt: { type: Date, required: true },
        updatedBy: { type: Types.ObjectId, ref: 'User' },
        status: { type: String, enum: Object.keys(BookingStatusType), default: 'PENDING' }
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
