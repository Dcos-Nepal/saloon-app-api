export interface IProduct {
  _id?: string;
  name: string;
  tags?: string[];
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Product extends IProduct, Document {
  _id?: string;
}
