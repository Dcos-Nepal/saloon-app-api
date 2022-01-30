import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { Controller, Get, Post, Body, UseGuards, UseInterceptors, Param, Query, Put, UploadedFile } from '@nestjs/common';

import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { IResponse } from '../../common/interfaces/response.interface';
import { ResponseSuccess, ResponseError } from '../../common/dto/response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { ProfileDto } from './dto/profile.dto';
import { SettingsDto } from './dto/settings.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { IUser, User } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserPropertyDto } from './dto/create-user-property.dto';
import { Property } from '../properties/interfaces/property.interface';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller({
  path: '/users',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async findAll(@CurrentUser() authUser: User, @Query() query): Promise<IResponse> {
    const filter: mongoose.FilterQuery<User> = { _id: { $ne: authUser._id } };

    if (query.q) filter.fullName = { $regex: query.q, $options: 'i' };
    if (query.roles) filter.roles = { $in: query.roles.split(',') };

    if (query.nearBy && query.lat && query.lon) {
      filter.location = {
        $near: {
          $maxDistance: +query.nearBy || 1000,
          $geometry: { type: 'Point', coordinates: [+query.lat, +query.lon] }
        }
      };
    }

    try {
      const users = await this.usersService.findAll(filter, { authUser, fields: '-password' });
      return new ResponseSuccess('COMMON.SUCCESS', users);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/me')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async myProfile(@CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const user = await this.usersService.findById(authUser.id);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:id')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async findById(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findById(params.id);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:id/properties')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async findProperties(@Param() params, @Query() query): Promise<IResponse> {
    try {
      const properties = await this.usersService.findProperties(params.id, query);
      return new ResponseSuccess('COMMON.SUCCESS', properties);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:id')
  @UseGuards(SelfOrAdminGuard)
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
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async findByEmail(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findByEmail(params.email);
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post('/profile/update')
  @UseGuards(SelfOrAdminGuard)
  async updateProfile(@Body() profileDto: ProfileDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateProfile(profileDto);
      return new ResponseSuccess('PROFILE.UPDATE_SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('PROFILE.UPDATE_ERROR', error);
    }
  }

  @Post('settings/update')
  async updateSettings(@Body() settingsDto: SettingsDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateSettings(settingsDto);
      return new ResponseSuccess('SETTINGS.UPDATE_SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('SETTINGS.UPDATE_ERROR', error);
    }
  }

  @Post('profile/avatar')
  @UseGuards(SelfOrAdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@CurrentUser() authUser, @UploadedFile() file: Express.Multer.File) {
    const session = await this.connection.startSession();
    let updatedUser: User;
    await session.withTransaction(async () => {
      updatedUser = await this.usersService.addAvatar(authUser._id, file.buffer, file.originalname, session);
    });
    session.endSession();

    return updatedUser;
  }

  @Post('/:userId/properties')
  @UseGuards(SelfOrAdminGuard)
  async createProperty(@Param() params, @Body() property: CreateUserPropertyDto, @CurrentUser() authUser: IUser): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newProperty: Property;
      await session.withTransaction(async () => {
        newProperty = await this.usersService.addProperty({ ...property, user: params.userId }, session, { authUser });
      });
      return new ResponseSuccess('PROPERTY_CREATED', newProperty);
    } catch (error) {
      return new ResponseError('PROPERTY_CREATE_ERROR', error);
    }
  }
}
