import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { AnyObject, ClientSession, Model, ObjectId } from 'mongoose';
import { Injectable, HttpStatus, HttpException, NotFoundException, Logger } from '@nestjs/common';

import { ProfileDto } from './dto/profile.dto';
import { SettingsDto } from './dto/settings.dto';
import { RegisterUserDto } from './dto/register-user.dto';

import { IServiceOptions } from 'src/common/interfaces';
import { IUser, User, IWorker } from './interfaces/user.interface';

import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';

import BaseService from 'src/base/base-service';
import { ConfigService } from 'src/configs/config.service';
import { PropertiesService } from '../properties/properties.service';
import { IProperty, Property } from '../properties/interfaces/property.interface';
import { PublicFilesService } from 'src/common/modules/files/public-files.service';

// For Encryption
const saltRounds = 10;

@Injectable()
export class UsersService extends BaseService<User, IUser> {
  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly publicFilesService: PublicFilesService,
    private readonly propertiesService: PropertiesService
  ) {
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

    const user: User = await this.userModel.findById(id).select('-password -__v');

    if (!user?._id) {
      throw new NotFoundException('User not found!');
    }

    // Encrypt the password
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    if (body.address) {
      body.userData = { ...user.toJSON().userData, ...body.userData };
      const coordinates = await await this.getCoordinates(`${body.address.street1}, ${body.address.city}, ${body.address.state}, ${body.address.country}`);
      body.userData.location = {
        coordinates,
        type: 'Point'
      };
    }

    return await this.userModel.findOneAndUpdate({ _id: id }, { ...body }, { new: true, lean: true, session }).select('-password -__v');
  }

  /**
   * Finds User using the email address
   *
   * @param email string
   * @returns Promise<User>
   */
  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).exec();
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
  async registerUser(newUser: RegisterUserDto, session: ClientSession): Promise<User> {
    if (this.isValidEmail(newUser.email) && newUser.password) {
      const userRegistered = await this.findByEmail(newUser.email);
      if (!userRegistered) {
        /**
         * Check if the user is referred by some other user
         */
        if (newUser?.userData?.referredBy) {
          const referrer = await this.findByReferralCode(newUser.userData.referredBy);
          if (referrer) {
            newUser.userData.referredBy = referrer._id;
          }
        }

        /**
         * Continue with registration process
         */

        // Generating New Password
        newUser.password = await bcrypt.hash(newUser.password, saltRounds);

        // Creating User Model
        const createdUser = new this.userModel(newUser);

        // Saving and returning the user
        return await createdUser.save({ session });
      } else if (!userRegistered.auth.email.verified) {
        return userRegistered;
      } else {
        throw new HttpException('REGISTRATION.USER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
      }
    } else {
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
   * Updates User Profile Info
   *
   * @param profileDto ProfileDto
   * @returns Promise<User>
   */
  async updateProfile(profileDto: ProfileDto): Promise<User> {
    const userFromDb: User = await this.userModel.findOne({ email: profileDto.email });

    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (profileDto.firstName) {
      userFromDb.firstName = profileDto.firstName;
    }

    if (profileDto.lastName) {
      userFromDb.lastName = profileDto.lastName;
    }

    if (profileDto.phoneNumber) {
      userFromDb.phoneNumber = profileDto.phoneNumber;
    }

    await userFromDb.save();
    return userFromDb;
  }

  /**
   * Updates User's Settings
   *
   * @param settingsDto SettingsDto
   * @returns Promise<User>
   */
  async updateSettings(settingsDto: SettingsDto): Promise<User> {
    const userFromDb = await this.userModel.findOne({ email: settingsDto.email });

    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    userFromDb.settings = userFromDb.settings;

    for (const key in settingsDto) {
      if (settingsDto.hasOwnProperty(key) && key != 'email') {
        userFromDb.settings[key] = settingsDto[key];
      }
    }

    await userFromDb.save();
    return userFromDb;
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
  async markEmailAsConfirmed(email: string) {
    const userFromDb: User = await this.userModel.findOne({ email: email });

    if (!userFromDb.auth.email.verified) {
      return this.userModel.updateOne({ email }, { auth: { email: { verified: true } } });
    }

    return userFromDb;
  }

  /**
   * Marks Phone Number as confirmed/verified
   * @param userId String
   * @returns Promise<User>
   */
  async markPhoneNumberAsConfirmed(userId: string) {
    const userFromDb: User = await this.userModel.findOne({ _id: userId });

    if (!userFromDb.auth.email.verified) {
      return this.userModel.updateOne({ _id: userId }, { auth: { phoneNumber: { verified: true } } });
    }

    return userFromDb;
  }

  /**
   * Adds User Avatar
   *
   * @param userId String
   * @param imageBuffer Buffer
   * @param filename String
   * @param session ClientSession
   *
   * @returns Promise<User>
   */
  async addAvatar(userId: string, fileBuffer: Buffer, filename: string, session: ClientSession): Promise<User> {
    const user: User = await this.userModel.findById(userId);

    if (!user?._id) {
      throw new NotFoundException('User not found!');
    }

    this.logger.log('Uploading profile picture to AWS S3 bucket.');
    const avatar = await this.publicFilesService.uploadFileToS3(fileBuffer, filename, false);

    this.logger.log('Updating profile picture.');
    user.avatar = {
      key: avatar.Key,
      url: avatar.Location
    };

    await user.save({ session });
    this.logger.log('User profile picture updated.');

    return user;
  }

  /**
   * Find Propertied for given User
   *
   * @param userId String
   * @param query AnyObject
   * @returns Object
   */
  async findProperties(userId: string, query: AnyObject) {
    return await this.propertiesService.findAll({ ...query, user: userId });
  }

  /**
   * Add Property for given User
   *
   * @param property IProperty
   * @param session ClientSession
   * @param param IServiceOptions
   * @returns Promise<Property>
   */
  async addProperty(property: IProperty, session: ClientSession, { authUser }: IServiceOptions): Promise<Property> {
    return await this.propertiesService.create(property, session, { authUser });
  }

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

  async getSummary() {
    const filter: mongoose.FilterQuery<any> = {};
    filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

    const [workerCount, clientCount] = await Promise.all([
      this.model.countDocuments({ ...filter, type: 'WORKER' }),
      this.model.countDocuments({ ...filter, type: 'CLIENT' })
    ]);
    return {
      workerCount,
      clientCount,
      total: workerCount + clientCount
    };
  }

  /**
   * Get coordinates of location
   * @param location
   * @returns coordinates
   */
  async getCoordinates(location: string) {
    try {
      const address = encodeURI(location);
      const apiKey = this.configService.getGeoCoordinatesConfig().apiKey;
      const locations: AnyObject = await this.httpService.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`).toPromise();

      return locations?.data?.results?.length
        ? [+locations?.data?.results[0]?.geometry?.location?.lng, +locations?.data?.results[0]?.geometry?.location?.lat]
        : [0, 0];
    } catch (ex) {
      this.logger.error(ex);

      return [0, 0];
    }
  }

  /**
   * Gets recommendations by filtering by availability and jobType
   * @param recommendations
   * @param jobType
   * @param dateWithStartTime
   * @param dateWithEndTime
   * @returns workers
   */
  getRelevantRecommendedWorkers = (recommendations, jobType, dateWithStartTime, dateWithEndTime) => {
    const date = new Date();

    return recommendations.filter((recommendation) => {
      const userData: IWorker = recommendation.userData;

      if (jobType && !userData?.services?.includes(jobType)) {
        return false;
      }

      const startTimes = userData.workingHours?.start?.split(':');
      if (dateWithStartTime && (!startTimes || startTimes.length < 2 || dateWithStartTime < date.setHours(parseInt(startTimes[0]), parseInt(startTimes[1])))) {
        return false;
      }

      const endTimes = userData.workingHours?.end?.split(':');
      if (dateWithEndTime && (!endTimes || endTimes.length < 2 || dateWithEndTime > date.setHours(parseInt(endTimes[0]), parseInt(endTimes[1])))) {
        return false;
      }

      return true;
    });
  };

  /**
   * Provide workers recommendation
   * @param query
   * @returns workers
   */
  async getRecommendedWorkers(query: AnyObject) {
    const filters = {
      roles: { $in: ['WORKER'] },
      $or: [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }]
    };

    if (query.jobType) {
      filters['userData.jobType'] = { $eq: query.jobType };
    }

    if ((query.lat && query.lon) || query.address) {
      filters['userData.location'] = {
        $near: {
          $maxDistance: 500,
          $geometry: {
            type: 'Point',
            coordinates: query.lat && query.lon ? [+query.lat, +query.lon] : await this.getCoordinates(query.address)
          }
        }
      };
    }

    const recommendations = await this.model.find(filters);

    if (!query.startTime && !query.endTime && !query.jobType) {
      return recommendations.slice(0, query.limit || 5);
    }

    const date = new Date();
    const dateWithStartTime =
      query.startTime?.split(':')?.length > 1 ? date.setHours(parseInt(query.startTime.split(':')[0]), parseInt(query.startTime.split(':')[1])) : null;
    const dateWithEndTime =
      query.endTime?.split(':')?.length > 1 ? date.setHours(parseInt(query.endTime.split(':')[0]), parseInt(query.endTime.split(':')[1])) : null;

    return this.getRelevantRecommendedWorkers(recommendations, query.jobType, dateWithStartTime, dateWithEndTime).slice(0, query.limit || 5);
  }
}
