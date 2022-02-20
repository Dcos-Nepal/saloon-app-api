import { IsOptional, IsString } from 'class-validator';

export class JobFeedbackDto {
  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  rating: number;

  @IsOptional()
  date?: Date;
}
