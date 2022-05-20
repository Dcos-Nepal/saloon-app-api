import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateJobRequestDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsString()
  @IsMongoId()
  client: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  property?: string;

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

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
