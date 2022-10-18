export interface ICustomer {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  address: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  referredBy?: string;
  email?: string;
  shopId?: string;
  memberCode?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Customer extends ICustomer, Document {
  _id?: string;
}
