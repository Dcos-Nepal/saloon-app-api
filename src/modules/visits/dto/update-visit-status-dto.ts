import { IsEnum } from 'class-validator';
import { VisitStatusType } from '../interfaces/visit.interface';

export class UpdateJobStatusDto {
  @IsEnum(VisitStatusType)
  status: VisitStatusType;
}
