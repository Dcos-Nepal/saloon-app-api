import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from 'src/configs/config.service';
import { Twilio } from 'twilio';

@Injectable()
export default class SmsService {
  private twilioClient: Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  /**
   * Initiate Phone Number verification
   * @param phoneNumber
   * @returns
   */
  initiatePhoneNumberVerification(phoneNumber: string) {
    const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID');
    return this.twilioClient.verify.services(serviceSid).verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  /**
   * Confirm Phone Number
   * @param phoneNumber
   * @param verificationCode
   * @returns Promise<any>
   */
  async confirmPhoneNumber(phoneNumber: string, verificationCode: string) {
    const serviceSid = this.configService.get('TWILIO_VERIFICATION_SERVICE_SID');
    const result = await this.twilioClient.verify.services(serviceSid).verificationChecks.create({ to: phoneNumber, code: verificationCode });

    if (!result.valid || result.status !== 'approved') {
      throw new BadRequestException('Wrong code provided');
    }

    return result;
  }

  /**
   * Send SMS Message
   * @param receiverPhoneNumber String
   * @param message String
   * @returns Promise<any>
   */
  async sendMessage(receiverPhoneNumber: string, message: string) {
    const senderPhoneNumber = this.configService.get('TWILIO_SENDER_PHONE_NUMBER');

    return this.twilioClient.messages.create({ body: message, from: senderPhoneNumber, to: receiverPhoneNumber });
  }
}
