import { IUser } from '../interfaces/user.interface';
import { SettingsDto } from './settings.dto';
import { UserAddressDto } from './user-address.dto';

export class UserDto {
  constructor(object: IUser) {
    this._id = object._id;
    this.firstName = object.firstName;
    this.lastName = object.lastName;
    this.email = object.email;
    this.phoneNumber = object.phoneNumber;
    this.address = object.address;
    this.settings = new SettingsDto(object.settings);
    this.roles=object.roles;
  }

  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  settings?: SettingsDto;
  address?: UserAddressDto;
  roles?:string[];
}
