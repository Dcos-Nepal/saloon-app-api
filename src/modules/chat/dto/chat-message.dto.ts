import { IsDate, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import {Type} from 'class-transformer';

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
  @Type(()=>Date)
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
