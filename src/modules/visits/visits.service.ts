import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

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
}
