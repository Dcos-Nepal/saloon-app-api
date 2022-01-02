import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

import { ConfigService } from 'src/configs/config.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import IMail, { IMailResponse } from 'src/common/interfaces/mail-interface';

@Injectable()
class NodeMailerHelper implements IMail {
  private transporter: SMTPTransport.Options;
  private from: string;

  constructor(public configService: ConfigService) {
    this.transporter = {
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') == 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS')
      }
    };

    this.from = `Orange Cleaning (AU) <${this.configService.get('MAIL_USER')}>`;
  }

  /**
   * Send Email Function using node-mailer
   * @param to String[]
   * @param subject String
   * @param html String
   * @returns Object
   */
  async sendEmail(to: string | string[], subject: string, html: string): Promise<IMailResponse> {
    to = Array.isArray(to) ? to.join() : to;
    const mailer = nodemailer.createTransport(this.transporter);
    const mailOptions = { from: this.from, to, subject, html };
    const sent = await mailer.sendMail(mailOptions);
    return { messageId: sent.messageId };
  }
}

export default NodeMailerHelper;
