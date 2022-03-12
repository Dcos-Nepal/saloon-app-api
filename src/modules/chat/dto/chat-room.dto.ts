import { ObjectId } from 'mongoose';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ChatRoomDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  owner?: string | ObjectId;

  @IsOptional()
  @IsMongoId()
  members?: string[] | ObjectId[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class ChatRoomQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  owner?: string;

  @IsOptional()
  @IsMongoId()
  member?: string;
}
