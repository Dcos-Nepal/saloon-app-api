import { IsBoolean, IsDate, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetInvoiceQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsMongoId()
  @IsOptional()
  invoiceFor?: string;

  @IsBoolean()
  @IsOptional()
  issued?: boolean;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsDate()
  @IsOptional()
  paidDate?: Date;

  @IsString()
  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
