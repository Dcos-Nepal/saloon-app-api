export interface IShop {
  _id?: string;
  logo: string;
  name: string;
  address?: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Shop extends IShop, Document {
  _id?: string;
}
