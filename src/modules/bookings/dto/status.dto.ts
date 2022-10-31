import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { BookingStatusType } from '../interfaces/booking.interface';

export class Status {
  @IsOptional()
  updatedAt: Date;

  @IsMongoId()
  @IsOptional()
  updatedBy: string;

  @IsEnum(BookingStatusType)
  status: BookingStatusType;
}
