import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class Worker {
  @ApiProperty()
  @IsMongoId()
  user: Types.ObjectId;

  @IsOptional()
  type: string;
}
