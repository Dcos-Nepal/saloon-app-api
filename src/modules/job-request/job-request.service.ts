import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BaseService from 'src/base/base-service';
import { IJobRequest, JobRequest } from './interfaces/job-request.interface';

@Injectable()
export class JobRequestService extends BaseService<JobRequest, IJobRequest> {
  constructor(@InjectModel('JobRequest') private readonly jobRequestModel: Model<JobRequest>) {
    super(jobRequestModel);
  }
}
