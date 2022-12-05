import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AppointmentType } from 'src/modules/appointments/schemas/appointment.schema';
import { Status } from './status.dto';

export class CreateBookingDto {
  @IsString()
  @IsOptional()
  customer?: string;

  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;

  @IsString()
  type: AppointmentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Status)
  status?: Status;

  @IsOptional()
  statusHistory?: Status[];

  @IsOptional()
  @IsString()
  isDeleted?: boolean;
}
