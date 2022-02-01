import { IsString } from 'class-validator';

export class UpdateUserDeviceDto {
  @IsString()
  user: string;

  @IsString()
  deviceToken: string;

  @IsString()
  deviceType?: string;
}
