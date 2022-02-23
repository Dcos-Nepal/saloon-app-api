import { Type } from 'class-transformer';
import { IInvoice } from '../interfaces/invoice.interface';
import { JobLineItem } from 'src/modules/jobs/dto/job-line-items.dto';
import { IsArray, IsBoolean, IsDate, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateInvoiceDto implements IInvoice {
  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsMongoId()
  invoiceFor: string;

  @IsMongoId()
  @IsOptional()
  refJob?: string;

  @IsMongoId()
  @IsOptional()
  refVisit?: string;

  @IsBoolean()
  @IsOptional()
  issued?: boolean;

  @IsNumber()
  total: number;

  @IsBoolean()
  isPaid: boolean;

  @IsDate()
  @IsOptional()
  paidDate?: Date;

  @IsBoolean()
  @IsOptional()
  dueOnReceipt?: boolean;

  @IsNumber()
  @IsOptional()
  dueDuration?: number;

  @IsDate()
  @IsOptional()
  due?: string | Date;

  @IsArray()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems: JobLineItem[];
}
