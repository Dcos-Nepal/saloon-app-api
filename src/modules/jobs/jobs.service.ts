import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { Job, IJob, IJobStatusType } from './interfaces/job.interface';

@Injectable()
export class JobsService extends BaseService<Job, IJob> {
  constructor(@InjectModel('Quotes') private readonly quoteModel: Model<Job>) {
    super(quoteModel);
  }

  async updateStatus(quoteId: string, statusType: IJobStatusType, session: ClientSession, { authUser }: IServiceOptions) {
    const quote = await this.findById(quoteId);
    quote.statusRevision.push(quote.status);
    quote.status = { status: statusType, updatedBy: authUser._id, updatedAt: new Date() };
    return await this.update(quoteId, quote, session, { authUser });
  }
}
