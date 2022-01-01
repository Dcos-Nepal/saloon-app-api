import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email can not be empty' })
  @IsEmail({ message: 'Invalid email provided' })
  email: string;
}
