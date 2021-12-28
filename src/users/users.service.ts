import * as _ from 'lodash'
import * as bcrypt from 'bcryptjs'
import { AnyObject, FilterQuery, Model, ObjectId } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable, HttpStatus, HttpException, NotFoundException } from '@nestjs/common'

import { ProfileDto } from './dto/profile.dto'
import { SettingsDto } from './dto/settings.dto'
import { User } from './interfaces/user.interface'
import { CreateUserDto } from './dto/create-user.dto'
import BaseService, { IServiceOptions } from 'src/base/base-service'

const saltRounds = 10

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    super(userModel)
  }

  async findAll(query: AnyObject, { authUser }: IServiceOptions) {
    const cond: FilterQuery<User> = { _id: { $ne: authUser._id } }
    const limit = parseInt(query['limit'] || 10)
    const skip = (parseInt(query['page']) - 1) * limit
    if (query.q) cond.fullName = { $regex: query.q, $options: 'i' }
    if (query.nearBy && query.lat && query.lon) {
      cond.location = {
        $near: {
          $maxDistance: +query.nearBy || 1000,
          $geometry: { type: 'Point', coordinates: [+query.lat, +query.lon] }
        }
      }
    }
    return await this.userModel
      .find(cond)
      .limit(limit)
      .skip(skip)
      .sort({ [query.sort || 'createdAt']: -1 })
  }

  /**
   * Finds User using the email address
   *
   * @param email string
   * @returns Promise<User>
   */
  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).exec()
  }

  /**
   * Creates New User in the System
   *
   * @param newUser CreateUserDto
   * @returns Promise<User>
   */
  async createNewUser(newUser: CreateUserDto): Promise<User> {
    try {
      if (this.isValidEmail(newUser.email) && newUser.password) {
        const userRegistered = await this.findByEmail(newUser.email)
        if (!userRegistered) {
          newUser.password = await bcrypt.hash(newUser.password, saltRounds)
          const createdUser = new this.userModel(newUser)
          return await createdUser.save()
        } else if (!userRegistered.auth.email.valid) {
          return userRegistered
        } else {
          throw new HttpException('REGISTRATION.USER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN)
        }
      } else {
        throw new HttpException('REGISTRATION.MISSING_MANDATORY_PARAMETERS', HttpStatus.FORBIDDEN)
      }
    } catch (error) {
      console.log('ERROR: ', error)
      throw new HttpException('REGISTRATION.ERROR', HttpStatus.INTERNAL_SERVER_ERROR)
    }
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
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    }

    return false
  }

  /**
   * Sets New Password
   *
   * @param email string
   * @param newPassword string
   * @returns Promise<boolean>
   */
  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email })
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND)

    userFromDb.password = await bcrypt.hash(newPassword, saltRounds)

    await userFromDb.save()
    return true
  }

  /**
   * Updates User Profile Info
   *
   * @param profileDto ProfileDto
   * @returns Promise<User>
   */
  async updateProfile(profileDto: ProfileDto): Promise<User> {
    const userFromDb: User = await this.userModel.findOne({ email: profileDto.email })

    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND)
    }

    if (profileDto.firstName) {
      userFromDb.firstName = profileDto.firstName
    }

    if (profileDto.lastName) {
      userFromDb.lastName = profileDto.lastName
    }

    if (profileDto.phoneNumber) {
      userFromDb.phoneNumber = profileDto.phoneNumber
    }

    await userFromDb.save()
    return userFromDb
  }

  /**
   * Updates User's Settings
   *
   * @param settingsDto SettingsDto
   * @returns Promise<User>
   */
  async updateSettings(settingsDto: SettingsDto): Promise<User> {
    const userFromDb = await this.userModel.findOne({ email: settingsDto.email })

    if (!userFromDb) {
      throw new HttpException('COMMON.USER_NOT_FOUND', HttpStatus.NOT_FOUND)
    }

    userFromDb.settings = userFromDb.settings

    for (const key in settingsDto) {
      if (settingsDto.hasOwnProperty(key) && key != 'email') {
        userFromDb.settings[key] = settingsDto[key]
      }
    }

    await userFromDb.save()
    return userFromDb
  }

  /**
   * Validates User using its User id
   *
   * @param id ObjectId | string
   * @returns Promise<User>
   */
  async validateUserById(id: ObjectId | string): Promise<User> {
    const user = await this.findById(id)

    if (!user) {
      throw new NotFoundException(`User of ID ${id} was not found`)
    }

    return user
  }

  /**
   * Generates sample UUID
   * @returns string
   */
  guid(): string {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }
}
