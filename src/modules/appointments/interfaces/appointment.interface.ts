export interface IAppointment {
  _id?: string;
  customer: string;
  notes: string;
  type: string;
  status?: string;
  services?: string;
  dateTime: Date;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Appointment extends IAppointment, Document {
  _id?: string;
}
