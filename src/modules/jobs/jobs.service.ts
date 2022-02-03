import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BaseService from 'src/base/base-service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, IJob } from './interfaces/job.interface';
import { IServiceOptions } from 'src/common/interfaces';
import { VisitsService } from '../visits/visits.service';
import { IVisit } from '../visits/interfaces/visit.interface';

@Injectable()
export class JobsService extends BaseService<Job, IJob> {
  constructor(private readonly visitsService: VisitsService, @InjectModel('Jobs') private readonly jobModel: Model<Job>) {
    super(jobModel);
  }

  async create(data: CreateJobDto, session: ClientSession, { authUser }: IServiceOptions) {
    const job = await super.create({ ...data, createdBy: authUser._id }, session);
    if (data.schedule) {
      const visitObj: IVisit = { ...data.schedule, job: job._id, inheritJob: true, isPrimary: true };
      if (data.schedule.excRrule) visitObj.excRrule = data.schedule.excRrule;
      const visit = await this.visitsService.create(visitObj, session);
      job.primaryVisit = visit._id;
      await visit.save({ session });
    }
    return job;
  }
}
