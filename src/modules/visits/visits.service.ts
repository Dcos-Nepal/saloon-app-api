import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Cron } from '@nestjs/schedule';
import { ClientSession, Model } from 'mongoose';
import RRule, { Frequency, rrulestr } from 'rrule';

import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { MailService } from 'src/common/modules/mail/mail.service';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';
import { CompleteVisitDto } from './dto/complete-visit.dto';
import { VisitFeedbackDto } from './dto/visit-feedback.dto';
import { Visit, IVisit, VisitStatusType } from './interfaces/visit.interface';
import SmsService from 'src/common/modules/sms/sms.service';
import { VisitSummaryDto } from './dto/summary.dto';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class VisitsService extends BaseService<Visit, IVisit> {
  logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
    private readonly fileService: PublicFilesService,
    @InjectModel('Visits') private readonly visitModel: Model<Visit>
  ) {
    super(visitModel);
    this.logger = new Logger(VisitsService.name);
  }

  /**
   * Get Visits based on the provided filters
   *
   * @param filter
   * @param options
   * @returns
   */
  async findAll(filter: any, options?: IServiceOptions) {
    if (filter.startDate || filter.endDate) {
      filter['$or'] = [];

      if (filter.startDate) filter['$or'].push({ startDate: { $lte: filter.startDate }, endDate: { $gte: filter.startDate } });
      if (filter.endDate) filter['$or'].push({ startDate: { $lte: filter.endDate }, endDate: { $gte: filter.endDate } });

      if (filter.startDate && filter.endDate) {
        filter['$or'].push({ startDate: { $gte: filter.startDate }, endDate: { $lte: filter.endDate } });
      }

      delete filter.startDate;
      delete filter.endDate;
    }

    return super.findAll(filter, options);
  }

  /**
   * Update Visit Info for given visit Id
   *
   * @param visitId String
   * @param statusType VisitStatusType
   * @param session ClientSession
   * @param param IServiceOptions
   * @returns Promise<Object>
   */
  async updateStatus(visitId: string, statusType: VisitStatusType, session: ClientSession, { authUser }: IServiceOptions) {
    const visit = await this.findById(visitId);
    visit.statusRevision.push(visit.status);
    visit.status = { status: statusType, updatedBy: authUser._id, updatedAt: new Date() };

    return await this.update(visitId, visit, session, { authUser });
  }

  /**
   *  Gets Summary for Visits
   *
   * @param filter VisitSummaryDto
   * @returns Visit[]
   */
  async getSummary(filter: VisitSummaryDto) {
    const cond: any = { $or: [{ startDate: { $gte: filter.startDate }, endDate: { $lte: filter.endDate } }] };

    if (filter.startDate) cond['$or'].push({ startDate: { $lte: filter.startDate }, endDate: { $gte: filter.startDate } });
    if (filter.endDate) cond['$or'].push({ startDate: { $lte: filter.endDate }, endDate: { $gte: filter.endDate } });

    if (filter.visitFor) cond['visitFor'] = filter.visitFor;
    if (filter.team) cond['team'] = filter.team;

    const visits = await this.visitModel.find(cond);
    const visitSummaries = visits.reduce((acc, visit) => {
      const totalPricePerVisit = visit.lineItems.reduce((acc, lineItem) => (acc += lineItem.quantity * lineItem.unitPrice), 0);
      const singleVisits = rrulestr(visit.rruleSet)
        .between(filter.startDate, filter.endDate, true)
        .map((visitDate) => {
          return {
            status: visit.status,
            startTime: visit.startTime,
            totalPrice: totalPricePerVisit,
            visitDate
          };
        });
      acc = [...acc, ...singleVisits];
      return acc;
    }, []);
    return visitSummaries;
  }

  /**
   * Update Visits
   * @param visit
   * @param session
   * @returns
   */
  async updateSelfAndFollowing(visit: IVisit, session: ClientSession) {
    const selectedVisit = await this.findById(visit._id);

    const until = DateTime.fromJSDate(visit.startDate).minus({ days: 1 }).toJSDate();
    const primaryRruleSet = new RRule({
      dtstart: selectedVisit.startDate,
      interval: 1,
      until: new Date(until),
      freq: Frequency.DAILY
    }).toString();

    selectedVisit.rruleSet = primaryRruleSet;
    await selectedVisit.save();

    await this.model.deleteMany({ visit: visit.job, isPrimary: false, startDate: { $gte: visit.startDate }, 'status.status': 'NOT-COMPLETED' });
    const remainingVisits = await this.model.find({ isPrimary: false, startDate: { $gte: visit.startDate } });

    const rruleSet = new RRule({
      dtstart: visit.startDate,
      interval: 1,
      until: selectedVisit.endDate,
      freq: Frequency.DAILY
    }).toString();

    const excRules = remainingVisits.map((visit) => {
      return new RRule({
        dtstart: visit.startDate,
        interval: 1,
        count: 1,
        freq: Frequency.DAILY
      }).toString();
    });

    delete visit._id;
    const addVisits = await this.create({ ...visit, rruleSet, excRrule: excRules, isPrimary: false }, session);
    return addVisits;
  }

  /**
   * Marks visit as complete
   *
   * @param visitId
   * @param visitCompleteDto
   * @param files
   * @param session
   * @returns Visit
   */
  async markVisitAsComplete(visitId: string, visitCompleteDto: CompleteVisitDto, files: Express.Multer.File[], session: ClientSession) {
    // Finding the visit
    const docs = [];
    const visit: any = await this.visitModel.findById(visitId, null, { session });

    if (visit && !visit.isCompleted) {
      // Uploading each files to AWS S3 and save their links to the visit
      for (const file of files) {
        const uploadedFile = await this.fileService.uploadFileToS3(file.buffer, file.originalname, file.mimetype, false);
        docs.push({ key: uploadedFile.Key, url: uploadedFile.Location });
      }

      visit.isCompleted = true;
      visit.completion = visitCompleteDto;
      visit.completion.docs = docs || [];

      // Updating Job completion details
      const updatedJob = await visit.save({ session });
      return updatedJob;
    }

    throw new NotFoundException('Error finding visit and marking it as complete');
  }

  /**
   * Update feedback for the visit
   *
   * @param visitId
   * @param visitFeedbackDto
   * @param session
   * @returns Visit
   */
  async provideVisitFeedback(visitId: string, visitFeedbackDto: VisitFeedbackDto, session: ClientSession) {
    const visit: Visit = await this.visitModel.findById(visitId, null, { session });
    visit.feedback = visitFeedbackDto;
    const updatedJob = await visit.save({ session });

    return updatedJob;
  }

  /**
   * Gets Todays Appointments
   * @returns Promise<Visit>
   */
  async getTodayVisits() {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    return await this.model
      .find({
        'status.status': VisitStatusType['NOT-COMPLETED'],
        startDate: { $gte: todayStart },
        endDate: { $lte: todayEnd }
      })
      .populate([
        {
          path: 'job',
          populate: [
            {
              path: 'jobFor',
              select: ['fullName', 'address', 'email', 'phoneNumber']
            },
            {
              path: 'property',
              select: ['name', 'street1', 'street2', 'city', 'state', 'postalCode', 'country']
            },
            {
              path: 'team',
              model: 'User',
              select: ['fullName', 'address', 'email', 'phoneNumber']
            }
          ],
          select: ['title', '']
        }
      ])
      .exec();
  }

  /**
   * Sends reminder of upcoming Appointments
   */
  async sendVisitReminder() {
    this.logger.log('Getting Todays Visits...');
    const visitsOfToday: any[] = await this.getTodayVisits();

    this.logger.log('Total Visits for today are: ', visitsOfToday.length || 0);

    visitsOfToday.forEach((visit) => {
      visit.job?.team.forEach(async (user) => {
        this.logger.log('Sending Message in mobile as SMS');
        await this.smsService.sendMessage(user.phoneNumber, "You've an appointment today. Please check your schedule in Mobile App/Web App");

        this.logger.log('Sending Message in email as reminder');
        this.mailService.sendEmail('Visit Reminder', `"Orange Cleaning" <${this.configService.getMailConfig().MAIL_USER}>`, user.email, {
          template: 'visit-reminder',
          context: {
            startTime: visit.startTime,
            instruction: visit.instruction,
            visitFor: `${visit.job?.jobFor.fullName}(${visit.job?.jobFor.phoneNumber || visit.job?.jobFor.email})`,
            receiverName: user.fullName.trim(),
            visitTitle: visit.title || visit.job.title,
            address: `${visit.job?.property.name}, ${visit.job?.property.street1}, ${visit.job?.property.street1}, ${visit.job?.property.city} ${visit.job?.property.postalCode}, ${visit.job?.property.state}`
          }
        });
      });
    });
  }

  /**
   * Runs the CORN Job every day 6AM in the Morning
   */
  @Cron('0 0 6 * * *', {
    name: 'Visit reminder',
    timeZone: 'Australia/Adelaide'
  })
  visitReminderScheduler() {
    this.logger.log(`Running the CORN Job at ${new Date().toDateString()}`);
    this.sendVisitReminder();
  }
}
