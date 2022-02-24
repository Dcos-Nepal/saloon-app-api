import { IsOptional, IsString, IsNumber } from 'class-validator';

export class JobFeedbackDto {
  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  rating: number;

  @IsOptional()
  date?: Date;
}
