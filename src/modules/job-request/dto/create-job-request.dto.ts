import { IsMongoId, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  status: string;
}
