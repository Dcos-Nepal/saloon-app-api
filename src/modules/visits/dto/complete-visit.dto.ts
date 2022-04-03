import { IsArray, IsOptional, IsDate, IsString } from 'class-validator';

export class CompleteVisitDto {
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
