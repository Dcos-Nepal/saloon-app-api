import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class Schedule {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  rruleSet: string;

  @IsString({ each: true })
  @IsOptional()
  excRrule?: string[];
}
