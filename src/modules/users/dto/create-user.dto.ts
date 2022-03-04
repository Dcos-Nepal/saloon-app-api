import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsEmail, MinLength, MaxLength, IsArray, IsOptional, ValidateNested, IsMongoId } from 'class-validator';

import { UserAddressDto } from './user-address.dto';
import { IUserRole } from '../interfaces/user.interface';
import { BaseUserModel } from '../models/base-user.model';
import { UserType } from '../schemas/user.schema';
import { ClientModel } from '../models/client-user.model';
import { WorkerModel } from '../models/worker-user.model';

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

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressDto)
  address: UserAddressDto;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BaseUserModel, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: ClientModel, name: UserType.CLIENT },
        { value: WorkerModel, name: UserType.WORKER }
      ]
    },
    keepDiscriminatorProperty: true
  })
  userData: ClientModel | WorkerModel;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
