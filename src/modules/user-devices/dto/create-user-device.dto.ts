import { IsString } from 'class-validator';

export class CreateUserDeviceDto {
  @IsString()
  user: string;

  @IsString()
  deviceToken: string;

  @IsString()
  deviceType?: string;
}
