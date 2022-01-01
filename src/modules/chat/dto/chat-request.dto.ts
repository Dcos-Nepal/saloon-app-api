import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ChatRequestDto {
  @IsOptional()
  @IsMongoId()
  inviter?: string;

  @IsMongoId()
  @IsNotEmpty({ message: 'Invitee can not be empty' })
  invitee: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class ChatRequestQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  inviter?: string;

  @IsOptional()
  @IsMongoId()
  invitee?: string;
}
