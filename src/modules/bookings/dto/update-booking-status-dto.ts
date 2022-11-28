import { IsString } from 'class-validator';
import { Status } from './status.dto';

export class UpdateJobStatusDto {
  status: Status;
}
