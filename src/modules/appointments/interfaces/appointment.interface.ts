import { AppointmentStatus } from "../schemas/appointment.schema";

export interface Status {
  name: AppointmentStatus;
  date: Date;
  duration?: string;
}

export interface IAppointment {
  _id?: string;
  customer: string;
  notes: string;
  type: string;
  status: Status;
  history?: Status[];
  services?: string[];
  dateTime: Date;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Appointment extends IAppointment, Document {
  _id?: string;
}
