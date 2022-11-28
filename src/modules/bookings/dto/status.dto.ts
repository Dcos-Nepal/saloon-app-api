import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { BookingStatusType } from '../interfaces/booking.interface';

export class Status {
  @IsEnum(BookingStatusType)
  status: BookingStatusType;

  @IsOptional()
  reason?: string;

  @IsOptional()
  updatedAt?: Date;

  @IsMongoId()
  @IsOptional()
  updatedBy?: string;
}
