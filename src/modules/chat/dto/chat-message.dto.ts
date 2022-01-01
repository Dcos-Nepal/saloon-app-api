import { IsDate, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ChatMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsMongoId()
  from?: string | ObjectId;

  @IsMongoId()
  to: string | ObjectId;

  @IsOptional()
  @IsMongoId()
  room?: string | ObjectId;

  @IsOptional()
  @IsDate()
  date?: Date;
}

export class ChatMessageQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  from?: string | ObjectId;

  @IsOptional()
  @IsMongoId()
  to: string | ObjectId;

  @IsOptional()
  @IsMongoId()
  room?: string | ObjectId;
}
