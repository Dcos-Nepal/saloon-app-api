import { Type } from 'class-transformer';
import { JobLineItem } from 'src/modules/jobs/dto/job-line-items.dto';
import { IsArray, IsBoolean, IsDate, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateVisitDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  instruction?: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  team?: string[];

  @IsBoolean()
  @IsOptional()
  inheritJob: boolean;

  @IsMongoId()
  @IsOptional()
  job: string;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems: JobLineItem[];

  @IsOptional()
  startDate: Date;

  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  rruleSet: string;

  @IsString({ each: true })
  @IsOptional()
  excRrule?: string[];
}
