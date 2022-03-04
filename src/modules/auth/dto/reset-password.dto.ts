import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail({ message: 'Invalid email provided' })
  email: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  currentPassword?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  newPassword: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  passwordToken?: string;
}
