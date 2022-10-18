import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { Injectable, HttpStatus, HttpException, NotFoundException, Logger } from '@nestjs/common';

import { IServiceOptions } from 'src/common/interfaces';
import { IUser, User } from './interfaces/user.interface';
import BaseService from 'src/base/base-service';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';

// For Encryption
const saltRounds = 10;

@Injectable()
export class UsersService extends BaseService<User, IUser> {
  // private logger: Logger = new Logger('UsersService');

  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    super(userModel);
  }

  /**
   * Update User's Details
   *
   * @param id
   * @param body
   * @param session
   * @param param IServiceOptions
   *
   * @returns Promise<User>
   */
  async update(id: string, body: Partial<IUser>, session: ClientSession, { authUser }: IServiceOptions) {
    if (authUser.roles.includes['ADMIN'] && authUser._id != id) throw new ForbiddenException();

    const autoPass = '';
    const user: User = await this.userModel.findById(id).select('-password -__v');

    if (!user?._id) {
      throw new NotFoundException("User you're trying to update is not found!");
    }

    // For Changed Email
    // If email has changed mark the auth.email.verified as false
    // if (body.email && body.email !== user.email) {
    //   if (!user?.auth?.email?.verified) {
    //     autoPass = randomString(10);
    //   }
    // }

    // For Changed Phone Number
    // If phone number has changed mark the auth.phoneNumber as false
    // if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
    //   user.auth.phoneNumber.verified = false;
    // }

    // Encrypt the password
    if (body.password || !!autoPass) {
      body.password = await bcrypt.hash(!!autoPass ? autoPass : body.password, 10);
    }

    return await this.userModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true, lean: true, session }).select('-password -__v');
  }

  /**
   * Finds User using the email address
   *
   * @param email string
   * @returns Promise<User>
   */
  async findByEmail(email: string, considerDeleted = false): Promise<User> {
    return await this.userModel.findOne({ email: email, isDeleted: !considerDeleted ? considerDeleted : true }).exec();
  }

  /**
   * Finds User using the referral code
   *
   * @param email string
   * @returns Promise<User>
   */
  async findByReferralCode(referralCode: string): Promise<User> {
    return await this.userModel.findOne({ 'userData.referralCode': referralCode }).exec();
  }

  /**
   * Registers New User in the System
   *
   * @param newUser RegisterUserDto
   * @returns Promise<User>
   */
  async registerUser(newUser: any, session: ClientSession): Promise<User> {
    if (this.isValidEmail(newUser.email) && newUser.password) {
      const userRegistered = await this.findByEmail(newUser.email);
      if (!userRegistered) {
        /**
         * Check if the user is referred by some other user
         */
        // if (newUser?.userData?.referredBy) {
        //   const referrer = await this.findByReferralCode(newUser.userData.referredBy);
        //   if (referrer) {
        //     newUser.userData.referredBy = referrer._id;
        //   }
        // }

        /**
         * Continue with registration process
         */

        // Generating New Password
        newUser.password = await bcrypt.hash(newUser.password, saltRounds);

        // Creating User Model
        const createdUser = new this.userModel(newUser);

        // Saving and returning the user
        return await createdUser.save({ session });
      } else {
        throw new HttpException('REGISTRATION.USER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
      }
    } else {
      if (newUser.firstName && newUser.lastName) {
        /**
         * Check if the user is referred by some other user
         */
        // if (newUser?.userData?.referredBy) {
        //   const referrer = await this.findByReferralCode(newUser.userData.referredBy);
        //   if (referrer) {
        //     newUser.userData.referredBy = referrer._id;
        //   }
        // }

        /**
         * Continue with registration process
         */

        if (newUser.password) {
          // Generating New Password
          newUser.password = await bcrypt.hash(newUser.password, saltRounds);
        }

        // Creating User Model
        const createdUser = new this.userModel(newUser);

        // Saving and returning the user
        return await createdUser.save({ session });
      }

      throw new HttpException('REGISTRATION.MISSING_MANDATORY_PARAMETERS', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Sets New Password
   *
   * @param email string
   * @param newPassword string
   * @returns Promise<boolean>
   */
  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    userFromDb.password = await bcrypt.hash(newPassword, saltRounds);

    await userFromDb.save();
    return true;
  }

  /**
   * Validates User using its User id
   *
   * @param id ObjectId | string
   * @returns Promise<User>
   */
  async validateUserById(id: ObjectId | string): Promise<User> {
    const user = await this.findById(id, { fields: '_id firstName lastName email auth phoneNumber' });

    if (!user) {
      throw new NotFoundException(`User of ID ${id} was not found`);
    }

    return user;
  }

  /**
   * Mark email as confirmed
   * @param email String
   * @returns Promise<User>
   */
  // async markEmailAsConfirmed(email: string) {
  //   const userFromDb: User = await this.userModel.findOne({ email: email });

  //   if (!userFromDb.auth.email.verified) {
  //     return this.userModel.updateOne({ email }, { auth: { email: { verified: true } } });
  //   }

  //   return userFromDb;
  // }

  /**
   * Marks Phone Number as confirmed/verified
   * @param userId String
   * @returns Promise<User>
   */
  // async markPhoneNumberAsConfirmed(userId: string) {
  //   const userFromDb: User = await this.userModel.findOne({ _id: userId });

  //   if (!userFromDb.auth.email.verified) {
  //     return this.userModel.updateOne({ _id: userId }, { auth: { phoneNumber: { verified: true } } });
  //   }

  //   return userFromDb;
  // }

  /**
   * Generates sample UUID
   * @returns string
   */
  guid(): string {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  /**
   * Check if the given email is a valid email address
   *
   * @param email string
   * @returns Boolean
   */
  isValidEmail(email: string): boolean {
    if (email) {
      const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    return false;
  }

  /**
   * Gets Summary for Users
   * @param filter mongoose.FilterQuery<User>
   * @returns Object
   */
  async getSummary(filter: mongoose.FilterQuery<User>) {
    filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

    const [workerCount, clientCount] = await Promise.all([
      this.model.countDocuments({ ...filter, roles: { $in: ['WORKER'] } }),
      this.model.countDocuments({ ...filter, roles: { $in: ['CLIENT'] } })
    ]);

    return {
      workerCount,
      clientCount,
      total: workerCount + clientCount
    };
  }
}
