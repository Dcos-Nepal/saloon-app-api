import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class VisitSummaryDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
