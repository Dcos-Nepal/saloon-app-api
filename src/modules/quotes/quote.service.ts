import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { Quote, IQuote, IQuoteStatusType } from './interfaces/quote.interface';

@Injectable()
export class QuoteService extends BaseService<Quote, IQuote> {
  constructor(@InjectModel('Quotes') private readonly quoteModel: Model<Quote>) {
    super(quoteModel);
  }

  /**
   * Update Quote Info for given visit Id
   *
   * @param visitId String
   * @param statusType IQuoteStatusType
   * @param session ClientSession
   * @param param IServiceOptions
   * @returns Promise<Object>
   */
  async updateStatus(quoteId: string, statusType: IQuoteStatusType, reason: string, session: ClientSession, { authUser }: IServiceOptions) {
    const quote = await this.findById(quoteId);
    quote.statusRevision.push(quote.status);
    quote.status = { status: statusType, reason: reason, updatedBy: authUser._id, updatedAt: new Date() };

    return await this.update(quoteId, quote, session, { authUser });
  }

  /**
   * Get Summary of Quotes
   * @param filter mongoose.FilterQuery<Quote>
   * @returns Promise<Object>
   */
  async getSummary(filter: mongoose.FilterQuery<Quote>) {
    const statusTypes = ['PENDING', 'ACCEPTED', 'REJECTED'];
    const [pendingCount, acceptedCount, rejectedCount] = await Promise.all(
      statusTypes.map((status) => this.quoteModel.countDocuments({ ...filter, 'status.status': status }))
    );
    return { pendingCount, acceptedCount, rejectedCount };
  }
}
