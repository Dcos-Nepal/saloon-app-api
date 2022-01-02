export interface ILineItem {
  _id?: string;
  name: string;
  description?: string;
  tags?: string[];
  refCost?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface LineItem extends ILineItem, Document {
  _id?: string;
}
