import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
export class CreatePackageClientDto {
  @IsString()
  customer: string;

  @IsString()
  packagePaidDate: string;

  @IsString()
  paymentType: 'CASH' | 'ONLINE' | 'CHEQUE';

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
}
