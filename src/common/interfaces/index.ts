import { IUser } from 'src/modules/users/interfaces/user.interface';

export interface IBaseAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: number;
  country: string;
}

interface IServiceOptions {
  authUser?: IUser;
  fields?: string;
}

interface IMailOption {
  template: string;
  context: Record<string, string>;
}

export { IUser, IServiceOptions, IMailOption };
