import { IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  street1: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: number;

  @IsString()
  country: string;
}
