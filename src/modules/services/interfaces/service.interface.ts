export interface IService {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Service extends IService, Document {
  _id?: string;
}
