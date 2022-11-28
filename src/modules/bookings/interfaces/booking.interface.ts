import { Document } from 'mongoose';
import { AppointmentType } from 'src/modules/appointments/schemas/appointment.schema';
import { User } from 'src/modules/users/interfaces/user.interface';
import { Status } from '../dto/status.dto';

export interface IBooking {
  _id?: any;
  fullName: string;
  phoneNumber: string;
  address: string;
  bookingDate: string;
  type: AppointmentType;
  status?: Status;
  statusHistory?: Status[];
  description?: string;
  isDeleted?: boolean;
}

export interface IBookingStatus {
  updatedAt: Date;
  status: BookingStatusType;
  updatedBy: string | User;
}

export enum BookingStatusType {
  'BOOKED' = 'BOOKED',
  'RE_SCHEDULED' = 'RE_SCHEDULED',
  'VISITED' = 'VISITED',
  'NOT VISITED' = 'NOT VISITED',
  'PNR' = 'PNR',
  'CANCELLED' = 'CANCELLED'
}

export interface Booking extends IBooking, Document {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
