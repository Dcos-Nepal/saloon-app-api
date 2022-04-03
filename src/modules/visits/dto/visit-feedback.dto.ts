import { IsOptional, IsString, IsNumber } from 'class-validator';

export class VisitFeedbackDto {
  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  rating: number;

  @IsOptional()
  date?: Date;
}