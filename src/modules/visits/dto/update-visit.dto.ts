import { Type } from 'class-transformer';
import { JobLineItem } from 'src/modules/jobs/dto/job-line-items.dto';
import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';

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

  @IsString({ each: true })
  @IsOptional()
  excRrule?: string[];

  @IsString()
  @IsOptional()
  rruleSet?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => JobLineItem)
  lineItems: JobLineItem[];
}
