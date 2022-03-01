import { IsBoolean, IsDate, IsOptional } from 'class-validator';

export class UpdateInvoiceDto {
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsDate()
  @IsOptional()
  paidDate?: Date;

  @IsDate()
  @IsOptional()
  due?: string | Date;
}
