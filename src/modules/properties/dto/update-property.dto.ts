import { IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsOptional()
  postalCode: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  user: string;
}
