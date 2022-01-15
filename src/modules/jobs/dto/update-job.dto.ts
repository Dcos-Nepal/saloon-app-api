import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { JobLineItem } from './quote-line-items.dto';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  instruction: string;

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
  @Type(() => JobLineItem)
  lineItems: JobLineItem[];
}
