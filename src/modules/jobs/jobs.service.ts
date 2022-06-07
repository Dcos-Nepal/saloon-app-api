import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { IServiceOptions } from 'src/common/interfaces';
import { User } from '../users/interfaces/user.interface';
import { Job, IJob } from './interfaces/job.interface';
import { IVisit } from '../visits/interfaces/visit.interface';
import { IMailResponse } from 'src/common/interfaces/mail-interface';

import { Schedule } from './dto/schedule';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CompleteJobDto } from './dto/complete-job.dto';
import { JobFeedbackDto } from './dto/job-feedback.dto';

import { ConfigService } from 'src/configs/config.service';
import BaseService from 'src/base/base-service';
import { VisitsService } from '../visits/visits.service';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';
import * as mongoose from 'mongoose';

@Injectable()
export class JobsService extends BaseService<Job, IJob> {
  private logger: Logger = new Logger('JobsService');

  constructor(
    @InjectModel('Jobs') private readonly jobModel: Model<Job>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly fileService: PublicFilesService,
    private readonly visitsService: VisitsService
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
        const uploadedFile = await this.fileService.uploadFileToS3(file.buffer, file.originalname, file.mimetype, false);
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
   * @param data CreateJobDto
   * @param session ClientSession
   * @param param IServiceOptions
   * @returns
   */
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

      return job;
    }
  }

  /**
   * Get Summary info
   * @param filter mongoose.FilterQuery<Job>
   * @returns Object
   */
  async getSummary(filter: mongoose.FilterQuery<Job>) {
    const [activeJobsCount, isCompleted] = await Promise.all([
      this.jobModel.countDocuments({ ...filter, startDate: { $lte: new Date() }, isCompleted: false }),
      this.jobModel.countDocuments({ ...filter, isCompleted: true })
    ]);
    return { activeJobsCount, isCompleted };
  }

  /**
   * Sends job assignment email
   *
   * @param userId String
   * @param jobId String
   * @returns Promise<boolean>
   */
  async sendJobAssignmentEmail(userId: string, jobId: string): Promise<boolean> {
    const assignee: User = await this.userModel.findById(userId).select(['fullName', 'email', 'auth']);

    if (!assignee.auth.email.verified) {
      return false;
    }

    try {
      const mailResponse: IMailResponse = await this.mailService.sendEmail(
        'Job Assignment Email',
        `"Orange Cleaning" <${this.configService.getMailConfig().MAIL_USER}>`,
        assignee.email,
        {
          template: 'job-assigned',
          context: {
            receiverName: assignee.fullName,
            linkToJob: `${this.configService.get('WEB_APP_URL')}/dashboard/jobs/${jobId}`
          }
        }
      );
      return mailResponse?.messageId ? true : false;
    } catch (error) {
      this.logger.error('Error: ', JSON.stringify(error));
      throw new HttpException('JOB_ASSIGNMENT.ERROR.SEND_MAIL', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Updates all Jobs for given query
   *
   * @param query any
   * @param data any
   * @param session ClientSession
   * @returns Object
   */
  async updateManyJobs(query: any, data: any, session: ClientSession) {
    const updatedJobs = await this.model.updateMany(query, { $set: data }, { session });

    return updatedJobs;
  }

  /**
   * Soft deleting job
   *
   * @param jobId String
   * @param session ClientSession
   * @returns Observable<Job>
   */
  async deleteJob(jobId: string, session: ClientSession) {
    const job = await this.jobModel.findById(jobId);

    if (job) {
      await this.softDelete(jobId, session);
      await this.visitsService.updateJobVisits(job._id, session);
    }

    return job;
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
    const visitObj: IVisit = {
      ...schedule,
      job: job._id,
      inheritJob: true,
      isPrimary: true,
      hasMultiVisit: job.type === 'RECURRING',
      visitFor: job.jobFor,
      team: job.team
    };
    if (schedule.excRrule) visitObj.excRrule = schedule.excRrule;
    return await this.visitsService.create(visitObj, session);
  }
}
