import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BaseService from 'src/base/base-service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, IJob } from './interfaces/job.interface';
import { IServiceOptions } from 'src/common/interfaces';
import { VisitsService } from '../visits/visits.service';
import { IVisit } from '../visits/interfaces/visit.interface';
import { Schedule } from './dto/schedule';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService extends BaseService<Job, IJob> {
  constructor(private readonly visitsService: VisitsService, @InjectModel('Jobs') private readonly jobModel: Model<Job>) {
    super(jobModel);
  }

  async create(data: CreateJobDto, session: ClientSession, { authUser }: IServiceOptions) {
    const job = await super.create({ ...data, createdBy: authUser._id }, session);
    if (data.schedule) {
      const primaryVisit = await this.createPrimaryVisit(job, data.schedule, session);
      job.primaryVisit = primaryVisit._id;
      job.startDate = primaryVisit.startDate;
      await job.save({ session });
    }

    return job;
  }

  async update(jobId: string, data: UpdateJobDto, session: ClientSession) {
    const job = await this.jobModel.findByIdAndUpdate(jobId, data, { session, new: true });
    if (data.schedule) {
      if (job.primaryVisit) await this.visitsService.update(job.primaryVisit.toString(), data.schedule, session);
      else await this.createPrimaryVisit(job, data.schedule, session);
    }

    return job;
  }

  async getSummary() {
    const [activeJobsCount, isCompleted] = await Promise.all([
      this.jobModel.countDocuments({ startDate: { $lte: new Date() }, isCompleted: false }),
      this.jobModel.countDocuments({ isCompleted: true })
    ]);
    return { activeJobsCount, isCompleted };
  }

  private async createPrimaryVisit(job: Job, schedule: Schedule, session: ClientSession) {
    const visitObj: IVisit = { ...schedule, job: job._id, inheritJob: true, isPrimary: true };
    if (schedule.excRrule) visitObj.excRrule = schedule.excRrule;
    return await this.visitsService.create(visitObj, session);
  }
}
