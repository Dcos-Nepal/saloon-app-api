export interface ICustomer {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  photos?: any[];
  diagnosis?: any[];
  productSuggestions?: any[];
  address: string;
  phoneNumber?: string;
  altPhoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  referredBy?: string;
  email?: string;
  shopId?: string;
  notes?: string;
  tags?: string;
  memberCode?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Customer extends ICustomer, Document {
  _id?: string;
}
