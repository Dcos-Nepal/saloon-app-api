import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  gender?: string;

  @IsString()
  dateOfBirth?: string;

  @IsString()
  referredBy?: string;

  @IsString()
  email?: string;

  @IsString()
  @IsOptional()
  shopId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class CustomerQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
