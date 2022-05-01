import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ClientModel {
  @ApiPropertyOptional()
  @IsOptional()
  location?: {
    type: string;
    coordinates: number[];
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referredBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  preferredTime?: [string];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCompanyNamePrimary?: boolean;
}
