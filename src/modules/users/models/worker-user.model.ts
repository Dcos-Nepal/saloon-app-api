import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class WorkerModel {
  @ApiPropertyOptional()
  @IsOptional()
  location?: {
    type: string;
    coordinates: number[];
  };

  @IsString()
  @IsOptional()
  jobType: string;

  @ApiPropertyOptional()
  @IsOptional()
  documents?: {
    idCard?: {
      url: string;
      key: string;
      type: 'ID_CARD';
    };
    cleaningCert?: {
      url: string;
      key: string;
      type: 'CLEANING_CERTIFICATE';
    };
    policeCert?: {
      url: string;
      key: string;
      type: 'POLICE_CERTIFICATE';
    };
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  workingDays?: [string];

  @ApiPropertyOptional()
  @IsOptional()
  workingHours: {
    start: string;
    end: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referredBy?: string;
}
