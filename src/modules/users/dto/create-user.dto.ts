import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength, MaxLength, IsArray, IsOptional, ValidateIf, IsMongoId } from 'class-validator';

import { IUserRole } from '../interfaces/user.interface';

export class CreateUserDto {
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
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  @ValidateIf((o) => o.email !== '')
  password: string;

  @IsOptional()
  createdBy?: string;

  @Exclude()
  @IsMongoId()
  @IsOptional()
  shopId?: string;
}
