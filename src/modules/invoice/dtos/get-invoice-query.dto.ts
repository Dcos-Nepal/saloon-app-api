import { IsBoolean, IsDate, IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class GetInvoiceQueryDto {
  @IsMongoId()
  @IsOptional()
  invoiceFor: string;

  @IsBoolean()
  @IsOptional()
  issued: boolean;

  @IsNumber()
  @IsOptional()
  total: number;

  @IsBoolean()
  @IsOptional()
  isPaid: boolean;

  @IsDate()
  @IsOptional()
  paidDate?: Date;
}
