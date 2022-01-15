import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { JobLineItem } from './quote-line-items.dto';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  instruction: string;

  @IsString()
  @IsMongoId()
  jobFor: string;

  @IsArray()
  @IsMongoId({ each: true })
  team: string[];

  @IsString()
  @IsMongoId()
  createdBy: string;

  @IsBoolean()
  @IsOptional()
  remindInvoicing?: boolean;

  @IsArray()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems: JobLineItem[];
}
