import { DateTime } from 'luxon';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BaseService from 'src/base/base-service';
import { User } from '../users/interfaces/user.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IInvoice, Invoice } from './interfaces/invoice.interface';
import { MailService } from 'src/common/modules/mail/mail.service';

@Injectable()
export class InvoiceService extends BaseService<Invoice, IInvoice> {
  constructor(@InjectModel('Invoice') private readonly invoiceModel: Model<Invoice>, private readonly mailService: MailService) {
    super(invoiceModel);
  }

  async sendInvoice(invoiceId: string, session: ClientSession) {
    const invoice = await this.invoiceModel.findById(invoiceId).populate('invoiceFor', 'email fullName');
    if (!invoice) throw new NotFoundException('Invoice not found');

    invoice.issued = true;
    invoice.issuedDate = new Date();

    if (invoice.dueDuration) invoice.due = DateTime.now().toUTC().toISODate();
    await invoice.save({ session });

    this.mailService.sendEmail('Verify Email', 'Orange Cleaning', (<User>invoice.invoiceFor).email, {
      template: 'confirm-account',
      context: {
        receiverName: (<User>invoice.invoiceFor).fullName,
        linkToActivate: ``
      }
    });

    return invoice;
  }
}
