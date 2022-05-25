import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BaseService from 'src/base/base-service';
import { IJobRequest, JobRequest } from './interfaces/job-request.interface';

@Injectable()
export class JobRequestService extends BaseService<JobRequest, IJobRequest> {
  constructor(@InjectModel('JobRequest') private readonly jobRequestModel: Model<JobRequest>) {
    super(jobRequestModel);
  }

  /**
   * Filters Job Requests
   *
   * @param filter mongoose.FilterQuery<JobRequest>
   * @returns Object
   */
  async getSummary(filter: mongoose.FilterQuery<JobRequest>) {
    const statusTypes = ['PENDING', 'IN-PROGRESS', 'ACTIVE', 'IN-ACTIVE'];

    const [pendingCount, inProgressCount, activeCount, inActiveCount] = await Promise.all(
      statusTypes.map((status) => this.jobRequestModel.countDocuments({ ...filter, status }))
    );

    return { pendingCount, inProgressCount, activeCount, inActiveCount };
  }
}
