import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateJobReqDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  client?: string;

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
