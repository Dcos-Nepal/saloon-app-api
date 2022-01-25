import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh Token can not be empty' })
  @IsString()
  refreshToken: string;
}
