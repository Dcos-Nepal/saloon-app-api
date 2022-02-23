import { IsString } from 'class-validator';
import { UserType } from '../schemas/user.schema';

export class BaseUserModel {
  @IsString()
  type: UserType;
}
