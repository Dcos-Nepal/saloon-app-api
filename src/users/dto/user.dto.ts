import { SettingsDto } from "./settings.dto";

export class UserDto {
  constructor(object: any) {
    this.firstName = object.firstName;
    this.lastName = object.lastName;
    this.email = object.email;
    this.phoneNumber = object.phoneNumber;
    this.settings = new SettingsDto(object.settings);
  }

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  settings?: SettingsDto;
}
