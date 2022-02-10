import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { JobLineItem } from 'src/modules/jobs/dto/job-line-items.dto';

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
  @IsOptional()
  property: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  createdBy: string;

  @IsString()
  @IsOptional()
  @IsMongoId()
  jobRequest: string;

  @IsArray()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems: JobLineItem[];
}
