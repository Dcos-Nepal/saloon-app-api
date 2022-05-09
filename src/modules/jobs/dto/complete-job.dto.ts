import { IsArray, IsOptional, IsString } from 'class-validator';

export class CompleteJobDto {
  @IsString()
  note: string;

  @IsOptional()
  @IsArray()
  docs?: any[];

  @IsString()
  completedBy: string;
}
