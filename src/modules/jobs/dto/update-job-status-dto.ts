import { IsEnum } from 'class-validator';
import { IJobStatusType } from '../interfaces/job.interface';

export class UpdateJobStatusDto {
  @IsEnum(IJobStatusType)
  status: IJobStatusType;
}
