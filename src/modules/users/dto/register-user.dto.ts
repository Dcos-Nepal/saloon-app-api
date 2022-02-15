import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsEmail, MinLength, MaxLength, IsArray } from 'class-validator';

import { IUserRole } from '../interfaces/user.interface';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid first name provided'
  })
  firstName: string;

  @ApiProperty()
  @IsString()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid last name provided'
  })
  lastName: string;

  @ApiProperty()
  @IsArray()
  roles: IUserRole[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({ message: 'Invalid email provided' })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/[0-9]{10}/, {
    message: 'Invalid phone number provided'
  })
  phoneNumber: string;
}
