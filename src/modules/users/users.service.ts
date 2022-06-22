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
import { formatAddress } from 'src/common/utils';
import { VerifyEmailService } from '../verify-email/verify-email.service';
import { randomString } from 'src/common/utils/random-string';

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
    private readonly propertiesService: PropertiesService,
    private readonly verifyEmailService: VerifyEmailService
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

    let autoPass = '';
    const user: User = await this.userModel.findById(id).select('-password -__v');

    if (!user?._id) {
      throw new NotFoundException("User you're trying to update is not found!");
    }

    // For Changed Email
    // If email has changed mark the auth.email.verified as false
    if (body.email && body.email !== user.email) {
      if (!user?.auth?.email?.verified) {
        autoPass = randomString(10);
      }

      user.auth.email.verified = false;

      // Send email verification email here
      await this.verifyEmailService.createEmailToken(body.email, session);

      // Sending email verification email
      !!autoPass
        ? await this.verifyEmailService.sendEmailVerification(body.email, !!autoPass, autoPass)
        : await this.verifyEmailService.sendEmailVerification(body.email);
    }

    // For Changed Phone Number
    // If phone number has changed mark the auth.phoneNumber as false
    if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
      user.auth.phoneNumber.verified = false;
    }

    // Encrypt the password
    if (body.password || !!autoPass) {
      body.password = await bcrypt.hash(!!autoPass ? autoPass : body.password, 10);
    }

    if (body.address) {
      body.userData = { ...user.toJSON().userData, ...body.userData };
      const coordinates = await this.getCoordinates(`${formatAddress(body.address)}`);
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
    const avatar = await this.publicFilesService.uploadFileToS3(fileBuffer, filename, 'image/png', false);

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

  /**
   * Get coordinates of location
   * @param location
   * @returns coordinates
   */
  async getCoordinates(location: string) {
    this.logger.log("Getting Coordinates using Client's address");
    try {
      const address = encodeURI(location);
      const apiKey = this.configService.getGeoCoordinatesConfig().apiKey;
      const locations: AnyObject = await this.httpService.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`).toPromise();

      this.logger.log('Getting the decoded coordinates for the client');
      return locations?.data?.results?.length
        ? [+locations?.data?.results[0]?.geometry?.location?.lng, +locations?.data?.results[0]?.geometry?.location?.lat]
        : [0, 0];
    } catch (ex) {
      this.logger.log("Error while decoding client's address to coordinates");
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
    this.logger.log("Getting today's date");
    const date = new Date();

    this.logger.log('Filtering the recommendations');
    return recommendations.filter((recommendation) => {
      const userData: IWorker = recommendation.userData;

      this.logger.log('Checks if the worker provides service requested in job');
      if (jobType && !userData?.services?.includes(jobType)) {
        return false;
      }

      this.logger.log("Preparing the Job Start Time with worker's availability");
      const startTimes = userData.workingHours?.start?.split(':');
      if (dateWithStartTime && (!startTimes || startTimes.length < 2 || dateWithStartTime < date.setHours(parseInt(startTimes[0]), parseInt(startTimes[1])))) {
        return false;
      }

      this.logger.log("Preparing the Job End Time with worker's availability");
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
    this.logger.log('Filters for finding workers that are active');
    const filters = {
      roles: { $in: ['WORKER'] },
      $or: [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }]
    };

    if (query.jobType) {
      this.logger.log('Filtering workers providing specific service or Job Type');
      filters['userData.jobType'] = { $eq: query.jobType };
    }

    if ((query.lat && query.lon) || query.address) {
      this.logger.log('Finding the users within the 40 KM of radius of Client');
      filters['userData.location'] = {
        $near: {
          $maxDistance: 40000, // 40x1000km = 40000KM
          $geometry: {
            type: 'Point',
            coordinates: query.lat && query.lon ? [+query.lat, +query.lon] : await this.getCoordinates(query.address)
          }
        }
      };
    }

    this.logger.log('Finding recommendations using the filters above');
    const recommendations = await this.model.find(filters);

    this.logger.log('returns first 5 recommendations if filters are not provided');
    if (!query.startTime && !query.endTime && !query.jobType) {
      return recommendations.slice(0, query.limit || 5);
    }

    this.logger.log("Getting today's date");
    const date = new Date();

    this.logger.log('Preparing Jobs Start date and time');
    const dateWithStartTime =
      query.startTime?.split(':')?.length > 1 ? date.setHours(parseInt(query.startTime.split(':')[0]), parseInt(query.startTime.split(':')[1])) : null;

    this.logger.log('Preparing Jobs End date and time');
    const dateWithEndTime =
      query.endTime?.split(':')?.length > 1 ? date.setHours(parseInt(query.endTime.split(':')[0]), parseInt(query.endTime.split(':')[1])) : null;

    this.logger.log('Getting relevant recommendations with the filters applied');
    return this.getRelevantRecommendedWorkers(recommendations, query.jobType, dateWithStartTime, dateWithEndTime).slice(0, query.limit || 5);
  }
}
