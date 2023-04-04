import { Exclude, Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreatePackageClientDto {
  @IsString()
  customer: string;

  @IsString()
  paymentType: 'CASH' | 'ONLINE' | 'CHEQUE';

  @IsString()
  packagePaidDate: string;

  @IsNumber()
  @Type(() => Number)
  noOfSessions: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDeleted: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isApproved?: boolean;

  @Exclude()
  @IsMongoId()
  @IsOptional()
  shopId?: string;
}
