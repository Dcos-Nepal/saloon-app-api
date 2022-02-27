import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdatePropertyDto {
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

  @IsString()
  @IsOptional()
  @IsOptional()
  status?: string;
}
