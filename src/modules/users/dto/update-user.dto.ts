import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, IsOptional, ValidateNested } from 'class-validator';
import { LocationDto } from './location.dto';
import { UserAddressDto } from './user-address.dto';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid first name provided'
  })
  firstName: string;

  @IsString()
  @IsOptional()
  @Matches(/[a-zA-Z0-9_-]{2,20}/, {
    message: 'Invalid last name provided'
  })
  lastName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressDto)
  address: UserAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
