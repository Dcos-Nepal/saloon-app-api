import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { ClientSession, Model } from 'mongoose';
import RRule, { Frequency, rrulestr } from 'rrule';

import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { Visit, IVisit, VisitStatusType } from './interfaces/visit.interface';

@Injectable()
export class VisitsService extends BaseService<Visit, IVisit> {
  constructor(@InjectModel('Visits') private readonly visitModel: Model<Visit>) {
    super(visitModel);
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
   * @param startDate Date
   * @param endDate Date
   * @returns Visit[]
   */
  async getSummary(startDate: Date, endDate: Date) {
    const visits = await this.visitModel.find({ startDate: { $gte: startDate, $lte: endDate } });
    const visitSummaries = visits.reduce((acc, visit) => {
      const totalPricePerVisit = visit.lineItems.reduce((acc, lineItem) => (acc += lineItem.quantity * lineItem.unitPrice), 0);
      const singleVisits = rrulestr(visit.rruleSet)
        .between(endDate, startDate, true)
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

    await this.model.deleteMany({ job: visit.job, isPrimary: false, startDate: { $gte: visit.startDate }, 'status.status': 'NOT-COMPLETED' });
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
}
