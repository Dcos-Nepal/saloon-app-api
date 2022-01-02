import { ConfigService } from 'src/configs/config.service';

const configService = new ConfigService();

export const EmailVerificationTemplate = (verificationToken: string) => {
  return `Hi! <br><br> Thanks for your registration<br><br>
    <a href=${configService.get('API_SERVER_URL')}:${configService.get('SERVER_PORT')}/auth/email/verify/${verificationToken}>
    Click here to activate your account</a>`;
};

export const ForgotPasswordTemplate = (newPasswordToken: string) => {
  return `Hi! <br><br> If you requested to reset your password<br><br><a href=${configService.get('API_SERVER_URL')}:${configService.get(
    'SERVER_PORT'
  )}/auth/email/reset-password/${newPasswordToken}>Click here</a>`;
};
