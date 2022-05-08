import { IsString, IsNotEmpty } from 'class-validator';

export class OtpVerifyCode {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export default OtpVerifyCode;
