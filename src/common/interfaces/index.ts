import { SortValues } from 'mongoose';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export interface IBaseAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: number;
  country: string;
}

interface IPopulate {
  path: string;
  select: string[];
}

interface IServiceOptions {
  authUser?: IUser; // Currently Logged in user
  fields?: string; // Fields to select form the main entity
  toPopulate?: IPopulate[]; // [{path: 'path', select: ['attributes list']}]
  sortBy?: Record<string, SortValues>;
}

interface IMailOption {
  template: string;
  context: Record<string, string>;
}

export interface ILineItemPricing {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export { IUser, IServiceOptions, IMailOption };
