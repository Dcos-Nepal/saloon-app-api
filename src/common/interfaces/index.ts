import { SortValues } from 'mongoose';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export interface IBaseAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IPopulate {
  path: string;
  model?: string;
  select: string[];
  populate?: IPopulate | IPopulate[];
}

export interface IServiceOptions {
  query?: Record<string, any>;
  authUser?: IUser; // Currently Logged in user
  fields?: string; // Fields to select form the main entity
  toPopulate?: IPopulate[]; // [{path: 'path', select: ['attributes list']}]
  sortBy?: Record<string, SortValues>;
  isSoftDelete?: boolean; // Decides wether to delete partially or completely
}

export interface IMailOption {
  template: string;
  context: Record<string, any>;
}

export interface ILineItemPricing {
  ref: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface IFindAll<Entity> {
  rows: Entity[];
  totalCount: number;
}

export { IUser };
