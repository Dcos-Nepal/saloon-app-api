import { DateTime } from 'luxon';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import BaseService from 'src/base/base-service';
import { User } from '../users/interfaces/user.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IInvoice, Invoice } from './interfaces/invoice.interface';
import { MailService } from 'src/common/modules/mail/mail.service';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class InvoiceService extends BaseService<Invoice, IInvoice> {
  constructor(
    @InjectModel('Invoice') private readonly invoiceModel: Model<Invoice>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {
    super(invoiceModel);
  }

  async sendInvoice(invoiceId: string, session: ClientSession) {
    const invoice = await this.invoiceModel.findById(invoiceId).populate('invoiceFor', 'email fullName auth');
    if (!invoice) throw new NotFoundException('Invoice not found');

    invoice.issued = true;
    invoice.issuedDate = new Date();

    if (invoice.dueDuration) {
      invoice.due = DateTime.now().toUTC().toISODate();
    }

    await invoice.save({ session });

    if (!(<User>invoice.invoiceFor).email || !(<User>invoice.invoiceFor).auth.email.verified) {
      return invoice;
    }

    const mailResponse = await this.mailService.sendEmail(
      `Invoice #${invoice.refCode} - Orange Cleaning`,
      `"Orange Cleaning" <${this.configService.getMailConfig().MAIL_USER}>`,
      (<User>invoice.invoiceFor).email,
      {
        template: 'invoice',
        context: {
          receiverName: (<User>invoice.invoiceFor).fullName,
          refCode: invoice.refCode,
          invoiceLink: `${this.configService.get('WEB_APP_URL')}/dashboard/invoices/${invoice._id}`
        }
      }
    );

    if (mailResponse?.messageId) {
      return invoice;
    }

    return null;
  }

  /**
   * Filters Job Invoices
   *
   * @param filter mongoose.FilterQuery<JobRequest>
   * @returns Object
   */
  async getSummary(filter: mongoose.FilterQuery<Invoice>) {
    const paidTypes = [true, false];

    const [paidCount, unpaidCount] = await Promise.all(paidTypes.map((isPaid) => this.invoiceModel.countDocuments({ ...filter, isPaid })));

    return { paidCount, unpaidCount };
  }
}
