import { IsArray, IsOptional, IsDate, IsString } from 'class-validator';

export class CompleteJobDto {
  @IsString()
  note: string;

  @IsOptional()
  @IsArray()
  docs?: any[];

  @IsString()
  completedBy: string;

  @IsDate()
  date: Date;
}
