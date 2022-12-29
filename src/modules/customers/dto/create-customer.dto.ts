import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class CreateSuggestionDto {
  @IsString()
  title: string;

  @IsMongoId()
  product: Types.ObjectId;

  @IsString()
  description: string;

  createdDate: Date;
}

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

  @IsOptional()
  diagonis?: any[];

  @IsOptional()
  @IsArray()
  @Type(() => CreateSuggestionDto)
  productSuggestions?: CreateSuggestionDto[];

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  altPhoneNumber?: string;

  @IsString()
  gender?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  referredBy?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  shopId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  tags?: string;

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
