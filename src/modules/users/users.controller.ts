import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, UseGuards, UseInterceptors, Param, Query, Put, Logger, Delete } from '@nestjs/common';

import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { IUser, User } from './interfaces/user.interface';
import { IResponse } from '../../common/interfaces/response.interface';

import { UsersService } from './users.service';

import { randomString } from 'src/common/utils/random-string';
import { ResponseSuccess, ResponseError } from '../../common/dto/response.dto';
import { CurrentUser } from 'src/common/decorators/current-user';

@ApiTags('users')
@Controller({
  path: '/users',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController {
  private logger: Logger = new Logger('UsersController');

  constructor(private readonly usersService: UsersService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  async findAll(@CurrentUser() authUser: User, @Query() query): Promise<IResponse> {
    let filter: mongoose.FilterQuery<User> = { _id: { $ne: authUser._id }, ...query };

    if (query.q) {
      filter = { fullName: { $regex: query.q, $options: 'i' } };
    }

    filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

    if (query.roles) filter.roles = { $in: query.roles.split(',') };
    if (query.createdBy) filter.createdBy = { $eq: query.createdBy };

    // Default Filter
    filter['shopId'] = { $eq: authUser.shopId };

    try {
      const users = await this.usersService.findAll(filter, { authUser, query, fields: '-password' });
      return new ResponseSuccess('COMMON.SUCCESS', users);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post('')
  async createUser(@CurrentUser() authUser, @Body() createUserDto: CreateUserDto): Promise<IResponse> {
    try {
      let autoPass = '';
      const session = await this.connection.startSession();
      createUserDto.shopId = authUser.shopId;

      if (createUserDto?.password === createUserDto?.phoneNumber || !!createUserDto?.phoneNumber) {
        autoPass = randomString(10);
        createUserDto.password = autoPass;
      }

      await session.withTransaction(async () => {
        // Add createdBy user
        createUserDto.createdBy = authUser?._id || null;

        // Continue with registration
        await this.usersService.registerUser(createUserDto, session);
      });
      session.endSession();
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Get('/summary')
  async summary(@Query() query): Promise<IResponse> {
    const filter: mongoose.FilterQuery<User> = { isDeleted: false };

    if (query?.createdBy) {
      filter.createdBy = { $eq: query.createdBy };
    }

    try {
      const summary = await this.usersService.getSummary(filter);
      return new ResponseSuccess('COMMON.SUCCESS', summary);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/me')
  async currentUserProfile(@CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const user = await this.usersService.findById((authUser as any).id);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:id')
  async findById(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findById(params.id);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:id')
  async update(@Body() body: UpdateUserDto, @Param() params, @CurrentUser() authUser: IUser): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedUser: User;
      await session.withTransaction(async () => {
        updatedUser = await this.usersService.update(params.id, body, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedUser);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:email')
  async findByEmail(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findByEmail(params.email);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:userId')
  async delete(@Param() param): Promise<IResponse> {
    try {
      let deletedUser: User;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        deletedUser = await this.usersService.softDelete(param.userId, session);
      });
      session.endSession();
      return new ResponseSuccess('COMMON.SUCCESS', deletedUser);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
