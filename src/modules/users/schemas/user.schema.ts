import { Schema, Types } from 'mongoose';
import { randomStringCaps } from 'src/common/utils/random-string';
import { User } from '../interfaces/user.interface';

export enum UserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SHOP_ADMIN = 'SHOP_ADMIN',
  RECEPTION = 'RECEPTION',
  CONSULTANT = 'CONSULTANT',
  CUSTOMER = 'CUSTOMER'
}

export const UserSchema: any = new Schema(
  {
    fullName: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    password: {
      type: String,
      required: function () {
        return this.email;
      }
    },
    roles: [{ type: String, required: true }],
    shopId: { type: Types.ObjectId, ref: 'Shop', required: false },
    memberCode: { type: String, required: false, default: null },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

/**
 * Before saving new User
 */
UserSchema.pre('save', function (this: User, next) {
  this.fullName = `${this.firstName} ${this.lastName}`;

  if (!this.roles.includes('SUPER_ADMIN') && this.roles.includes('SHOP_ADMIN')) {
    if (this.roles.includes('CUSTOMER')) {
      this.memberCode = `COS-${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}-${randomStringCaps()}`;
    }
  }
  next();
});

/**
 * Before finding and updating the User
 */
UserSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this.set('fullName', `${this.getUpdate()['firstName'] || docToUpdate.firstName} ${this.getUpdate()['lastName'] || docToUpdate.lastName}`);
  next();
});
