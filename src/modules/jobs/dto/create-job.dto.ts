import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { JobType } from '../interfaces/job.interface';
import { JobLineItem } from './job-line-items.dto';
import { Schedule } from './schedule';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  instruction: string;

  @IsString()
  @IsMongoId()
  jobFor: string;

  @IsString()
  @IsMongoId()
  property: string;

  @IsEnum(JobType)
  type: JobType;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  team?: string[];

  createdBy: string;

  @IsBoolean()
  @IsOptional()
  remindInvoicing?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems?: JobLineItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Schedule)
  schedule?: Schedule;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  notifyTeam?: boolean;
}
