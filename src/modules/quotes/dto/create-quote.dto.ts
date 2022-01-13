import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsString, ValidateNested } from 'class-validator';
import { QuoteLineItem } from './quote-line-items.dto';

export class CreateQuoteDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsMongoId()
  quoteFor: string;

  @IsString()
  @IsMongoId()
  createdBy: string;

  @IsString()
  @IsMongoId()
  jobRequest: string;

  @IsArray()
  @ValidateNested()
  @Type(() => QuoteLineItem)
  lineItems: QuoteLineItem[];
}
