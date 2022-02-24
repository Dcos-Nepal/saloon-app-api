import { Injectable, NotFoundException } from '@nestjs/common';
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
import { CompleteJobDto } from './dto/complete-job.dto';
import { JobFeedbackDto } from './dto/job-feedback.dto';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';

@Injectable()
export class JobsService extends BaseService<Job, IJob> {
  constructor(
    private readonly visitsService: VisitsService,
    @InjectModel('Jobs') private readonly jobModel: Model<Job>,
    private readonly fileService: PublicFilesService
  ) {
    super(jobModel);
  }

  /**
   * Marks job as complete
   *
   * @param jobId
   * @param jobCompleteDto
   * @param files
   * @param session
   * @returns Job
   */
  async markJobAsComplete(jobId: string, jobCompleteDto: CompleteJobDto, files: Express.Multer.File[], session: ClientSession) {
    // Finding the job
    const docs = [];
    const job: any = await this.jobModel.findById(jobId, null, { session });

    if (job && !job.isCompleted) {
      // Uploading each files to AWS S3 and save their links to the job
      for (const file of files) {
        const uploadedFile = await this.fileService.uploadPublicFile(file.buffer, file.originalname);
        docs.push({ key: uploadedFile.Key, url: uploadedFile.Location });
      }

      job.isCompleted = true;
      job.completion = jobCompleteDto;
      job.completion.docs = docs || [];

      // Updating Job completion details
      const updatedJob = await job.save({ session });
      return updatedJob;
    }

    throw new NotFoundException('Error finding job and marking it as complete');
  }

  /**
   * Update feedback for the job
   *
   * @param jobId
   * @param jobFeedbackDto
   * @param session
   * @returns Job
   */
  async provideJobFeedback(jobId: string, jobFeedbackDto: JobFeedbackDto, session: ClientSession) {
    const job: Job = await this.jobModel.findById(jobId, null, { session });
    job.feedback = jobFeedbackDto;
    const updatedJob = await job.save({ session });

    return updatedJob;
  }

  /**
   * Creates Job
   *
   * @param data
   * @param session
   * @param param2
   * @returns
   */
  async create(data: CreateJobDto, session: ClientSession, { authUser }: IServiceOptions) {
    const job = await super.create({ ...data, createdBy: authUser._id }, session);

    if (data.schedule) {
      const primaryVisit = await this.createPrimaryVisit(job, data.schedule, session);
      job.primaryVisit = primaryVisit._id;
      job.startDate = primaryVisit.startDate;
      await job.save({ session });

      // TODO
      // send notification here
      // for client
      // for Workers
    }

    return job;
  }

  /**
   * Updates Job
   *
   * @param jobId
   * @param data
   * @param session
   * @returns
   */
  async update(jobId: string, data: UpdateJobDto, session: ClientSession) {
    const job = await this.jobModel.findByIdAndUpdate(jobId, data, { session, new: true });

    if (job) {
      if (data.schedule) {
        if (job.primaryVisit) await this.visitsService.update(job.primaryVisit.toString(), data.schedule, session);
        else await this.createPrimaryVisit(job, data.schedule, session);
      }

      // TODO
      // send notification here
      // for client
      // for Workers

      return job;
    }
    // throw not found exception
  }

  /**
   * Get Summary info
   *
   * @returns Object
   */
  async getSummary() {
    const [activeJobsCount, isCompleted] = await Promise.all([
      this.jobModel.countDocuments({ startDate: { $lte: new Date() }, isCompleted: false }),
      this.jobModel.countDocuments({ isCompleted: true })
    ]);
    return { activeJobsCount, isCompleted };
  }

  /**
   * Private Functions
   */

  /**
   * Create Primary visit for a job
   *
   * @param job
   * @param schedule
   * @param session
   * @returns
   */
  private async createPrimaryVisit(job: Job, schedule: Schedule, session: ClientSession) {
    const visitObj: IVisit = { ...schedule, job: job._id, inheritJob: true, isPrimary: true, hasMultiVisit: job.type === 'RECURRING', visitFor: job.jobFor };
    if (schedule.excRrule) visitObj.excRrule = schedule.excRrule;
    return await this.visitsService.create(visitObj, session);
  }
}
