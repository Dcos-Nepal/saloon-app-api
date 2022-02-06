import { IsOptional, IsString } from 'class-validator';

/**
 * Standard Address DTO
 */
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
  postalCode: string;

  @IsString()
  country: string;
}
