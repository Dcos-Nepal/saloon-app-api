import { IsArray, IsOptional, IsString } from 'class-validator';

export class CompleteVisitDto {
  @IsString()
  note: string;

  @IsOptional()
  @IsArray()
  docs?: any[];

  @IsString()
  completedBy: string;
}
