import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, IsOptional, ValidateNested } from 'class-validator';
import { BaseUserModel } from '../models/base-user.model';
import { ClientModel } from '../models/client-user.model';
import { WorkerModel } from '../models/worker-user.model';
import { UserType } from '../schemas/user.schema';
import { UserAddressDto } from './user-address.dto';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid first name provided'
  })
  firstName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid last name provided'
  })
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressDto)
  address: UserAddressDto;

  @ApiPropertyOptional()
  @IsOptional()
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
  userData?: ClientModel | WorkerModel;
}
