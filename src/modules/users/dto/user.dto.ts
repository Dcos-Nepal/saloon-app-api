import { IClient, IUser, IWorker } from '../interfaces/user.interface';
import { SettingsDto } from './settings.dto';
import { UserAddressDto } from './user-address.dto';

export class UserDto {
  constructor(object: IUser) {
    this._id = object._id;
    this.userCode = object.userCode;
    this.firstName = object.firstName;
    this.lastName = object.lastName;
    this.email = object.email;
    this.phoneNumber = object.phoneNumber;
    this.address = object.address;
    this.settings = new SettingsDto(object.settings);
    this.roles = object.roles;
    this.userData = object.userData;
    this.lastOnline = object.lastOnline;
  }

  _id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  settings?: SettingsDto;
  address?: UserAddressDto;
  roles?: string[];
  userData?: IClient | IWorker;
  lastOnline?: Date;
}
