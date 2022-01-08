import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePropertyDto {
  name: string;

  @IsString()
  @IsOptional()
  street1: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsNumber()
  @IsOptional()
  postalCode: number;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  user: string;
}
