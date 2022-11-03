import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { Status } from '../interfaces/appointment.interface';

export class CreateAppointmentDto {
  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsArray()
  @IsOptional()
  services?: String[];

  @IsOptional()
  status: Status;

  @IsOptional()
  appointmentDate?: String;

  @IsOptional()
  appointmentTime?: String;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  createdDate?: String;
}

export class AppointmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  appointmentDate?: string;
}
