import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { Visit, IVisit, VisitStatusType } from './interfaces/visit.interface';

@Injectable()
export class VisitsService extends BaseService<Visit, IVisit> {
  constructor(@InjectModel('Visits') private readonly quoteModel: Model<Visit>) {
    super(quoteModel);
  }

  async updateStatus(quoteId: string, statusType: VisitStatusType, session: ClientSession, { authUser }: IServiceOptions) {
    const quote = await this.findById(quoteId);
    quote.statusRevision.push(quote.status);
    quote.status = { status: statusType, updatedBy: authUser._id, updatedAt: new Date() };
    return await this.update(quoteId, quote, session, { authUser });
  }
}
