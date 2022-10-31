import { IsEnum } from 'class-validator';
import { BookingStatusType } from '../interfaces/booking.interface';

export class UpdateJobStatusDto {
  @IsEnum(BookingStatusType)
  status: BookingStatusType;
}
