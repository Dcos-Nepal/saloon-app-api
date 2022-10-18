import { IsString } from 'class-validator';
import { IUserRole } from '../interfaces/user.interface';

export class BaseUserModel {
  @IsString()
  fullName?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  membershipCode?: string;

  @IsString()
  roles: IUserRole[];

  @IsString()
  shopId?: string;

  @IsString()
  isDeleted?: boolean;

  @IsString()
  referralCode?: string;

  @IsString()
  referredBy?: string;

  @IsString()
  createdBy?: string;
}
