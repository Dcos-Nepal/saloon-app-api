import { Type } from 'class-transformer';
import { JobLineItem } from '../../jobs/dto/job-line-items.dto';
import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Schedule } from 'src/modules/jobs/dto/schedule';

export class CreateVisitDto extends Schedule {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  inheritJob: boolean;

  @IsString()
  @IsOptional()
  instruction?: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  team?: string[];

  @IsMongoId()
  job: string;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems?: JobLineItem[];
}
