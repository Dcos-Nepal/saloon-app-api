import { IsOptional, IsString } from 'class-validator';

export class Schedule {
  @IsString()
  startDate: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  rruleSet: string;

  @IsString()
  @IsOptional()
  excRrule?: string;
}
