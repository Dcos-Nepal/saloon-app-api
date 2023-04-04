import { IsNotEmpty, IsEmail, IsString, MaxLength, MinLength, IsMongoId } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty({ message: 'Shop can not be empty' })
  @IsMongoId()
  shopId: string;

  @IsNotEmpty({ message: 'Email can not be empty' })
  @IsEmail({ message: 'Invalid email provided' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  password: string;

  @IsNotEmpty()
  @IsString()
  deviceToken?: string;

  @IsNotEmpty()
  @IsString()
  deviceType: 'WEB' | 'IOS' | 'ANDROID';
}
