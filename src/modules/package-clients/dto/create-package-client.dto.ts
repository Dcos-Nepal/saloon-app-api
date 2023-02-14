import { IsOptional, IsString } from 'class-validator';
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
  @IsString()
  isDeleted: boolean;

  @IsOptional()
  @IsString()
  isApproved?: boolean;
}
