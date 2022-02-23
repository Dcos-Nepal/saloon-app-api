import { IsDate, IsOptional, IsString } from 'class-validator';

export class Schedule {
  @IsDate()
  startDate: Date;

  @IsDate()
  @IsOptional()
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
