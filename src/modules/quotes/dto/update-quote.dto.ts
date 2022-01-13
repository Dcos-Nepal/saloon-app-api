import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuoteLineItem } from './quote-line-items.dto';

export class UpdateQuoteDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  quoteFor: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  jobRequest: string;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => QuoteLineItem)
  lineItems: QuoteLineItem[];
}
