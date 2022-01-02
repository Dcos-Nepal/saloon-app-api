import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserPropertyDto {
  @IsString()
  name: string;

  @IsString()
  street1: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsNumber()
  postalCode: number;

  @IsString()
  country: string;
}
