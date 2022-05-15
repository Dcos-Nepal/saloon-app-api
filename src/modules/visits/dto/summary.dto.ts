import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsOptional } from 'class-validator';

export class VisitSummaryDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsMongoId()
  @IsOptional()
  visitFor?: string;

  @IsMongoId()
  @IsOptional()
  team?: string;
}
