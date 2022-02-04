import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { JobLineItem } from './job-line-items.dto';
import { Schedule } from './schedule';

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

  @IsOptional()
  @ValidateNested()
  @Type(() => Schedule)
  schedule?: Schedule;
}
