import { IsDate } from 'class-validator';

export class VisitSummaryDto {
  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
