import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { Controller, Get, Post, Body, UseGuards, UseInterceptors, Param, Query, Put, UploadedFile, Logger, Delete } from '@nestjs/common';

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
import { CreateUserPropertyDto } from './dto/create-property.dto';
import { Property } from '../properties/interfaces/property.interface';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailService } from '../verify-email/verify-email.service';

@ApiTags('users')
@Controller({
  path: '/users',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController {
  private logger: Logger = new Logger('UsersController');

  constructor(
    private readonly usersService: UsersService,
    private readonly verifyEmailService: VerifyEmailService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  @Get()
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async findAll(@CurrentUser() authUser: User, @Query() query): Promise<IResponse> {
    let filter: mongoose.FilterQuery<User> = { _id: { $ne: authUser._id }, ...query };

    // Filters to listing Users
    if (query.q) {
      filter = { fullName: { $regex: query.q, $options: 'i' } };
    }

    filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

    if (query.roles) filter.roles = { $in: query.roles.split(',') };

    if (query.nearBy && query.lat && query.lon) {
      filter.userData.location = {
        $near: {
          $maxDistance: +query.nearBy || 1000,
          $geometry: { type: 'Point', coordinates: [+query.lat, +query.lon] }
        }
      };
    }

    try {
      const users = await this.usersService.findAll(filter, { authUser, query, fields: '-password' });
      return new ResponseSuccess('COMMON.SUCCESS', users);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post('')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async addNewUser(@CurrentUser() authUser, @Body() createUserDto: CreateUserDto): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newUser: User = null;
      let emailToken = false;

      await session.withTransaction(async () => {
        // Add createdBy user
        createUserDto.createdBy = authUser?._id || null;
        // Continue with registration
        newUser = await this.usersService.registerUser(createUserDto, session);
        emailToken = await this.verifyEmailService.createEmailToken(newUser.email, session);
      });
      session.endSession();

      if (newUser && emailToken) {
        const sent = await this.verifyEmailService.sendEmailVerification(newUser.email, true);

        if (sent) {
          return new ResponseSuccess('CREATION.USER_CREATED_SUCCESSFULLY');
        }

        return new ResponseError('CREATION.ERROR.MAIL_NOT_SENT');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError(error.message, error);
    }
  }

  @Get('/summary')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async summary(): Promise<IResponse> {
    try {
      const summary = await this.usersService.getSummary();
      return new ResponseSuccess('COMMON.SUCCESS', summary);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/recommendations')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async recommendation(@Query() query): Promise<IResponse> {
    try {
      const recommendations = await this.usersService.getRecommendedWorkers(query);
      return new ResponseSuccess('COMMON.SUCCESS', recommendations);
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
  @Roles('ADMIN', 'CLIENT', 'WORKER')
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
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
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
  @Roles('ADMIN', 'CLIENT', 'WORKER')
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
  @UseGuards(SelfOrAdminGuard)
  async updateSettings(@Body() settingsDto: SettingsDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateSettings(settingsDto);
      return new ResponseSuccess('SETTINGS.UPDATE_SUCCESS', new UserDto(user));
    } catch (error) {
      return new ResponseError('SETTINGS.UPDATE_ERROR', error);
    }
  }

  @Post('profile/avatar')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
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
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
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

  @Delete('/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedUser: User;
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
