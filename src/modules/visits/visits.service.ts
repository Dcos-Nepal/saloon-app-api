import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { rrulestr } from 'rrule';

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

  async getSummary(startDate: Date, endDate: Date) {
    const visits = await this.visitModel.find({ startDate: { $gte: startDate, $lte: endDate } });
    const visitSummaries = visits.reduce((acc, visit) => {
      const totalPricePerVisit = visit.lineItems.reduce((acc, lineItem) => (acc += lineItem.quantity * lineItem.unitPrice), 0);
      const singleVisits = rrulestr(visit.rruleSet)
        .between(endDate, startDate, true)
        .map((visitDate) => {
          return {
            startTime: visit.startTime,
            status: visit.status,
            totalPrice: totalPricePerVisit,
            visitDate
          };
        });
      acc = [...acc, ...singleVisits];
      return acc;
    }, []);
    return visitSummaries;
  }
}
