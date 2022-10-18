import { IUser } from '../interfaces/user.interface';

export class UserDto {
  constructor(object: IUser) {
    this._id = object._id;
    this.firstName = object.firstName;
    this.lastName = object.lastName;
    this.email = object.email;
    this.phoneNumber = object.phoneNumber;
    this.roles = object.roles;
  }

  _id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles?: string[];
}
