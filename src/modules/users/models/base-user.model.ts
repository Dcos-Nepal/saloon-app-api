import { IsString } from 'class-validator';

export class BaseUserModel {
  @IsString()
  type: string;
}
