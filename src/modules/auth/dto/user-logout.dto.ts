import { IsNotEmpty, IsString } from 'class-validator';

export class UserLogoutDto {
  @IsNotEmpty()
  @IsString()
  deviceToken?: string;

  @IsNotEmpty()
  @IsString()
  deviceType: 'WEB' | 'IOS' | 'ANDROID';
}
