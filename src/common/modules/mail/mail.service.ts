import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { IMailOption } from 'src/common/interfaces';

@Injectable()
export class MailService {
  private logger: Logger = new Logger('MailService');

  constructor(private mailerService: MailerService) {}

  /**
   * Send Email Function using node-mailer
   *
   * @param subject String
   * @param from String
   * @param to String[]
   * @param template String
   *
   * @returns Object
   */
  async sendEmail(subject: string, from: string, to: string | string[], options: IMailOption) {
    to = Array.isArray(to) ? to.join() : to;
    const mailOptions = { subject, from, to, template: options.template, context: options.context };

    this.logger.log('Sending mail now');
    const sent = await this.mailerService.sendMail(mailOptions);

    this.logger.log('Returning mail response');
    return { messageId: sent.messageId };
  }
}
