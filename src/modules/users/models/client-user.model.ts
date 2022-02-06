import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class Client {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  emailAddress: string;

  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;
}
