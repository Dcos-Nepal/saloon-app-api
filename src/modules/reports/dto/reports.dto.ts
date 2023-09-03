import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CustomerQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  isNewCustomer?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  appointmentStatus?: string;

  @IsOptional()
  @IsString()
  minDate?: string;

  @IsOptional()
  @IsString()
  maxDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
