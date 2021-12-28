import { Controller, Get, Post, Body, UseGuards, UseInterceptors, Param, Query } from '@nestjs/common'
import { UserDto } from './dto/user.dto'
import { UsersService } from './users.service'
import { IResponse } from '../common/interfaces/response.interface'
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor'
import { TransformInterceptor } from '../common/interceptors/transform.interceptor'
import { AuthGuard } from '../../node_modules/@nestjs/passport'
import { ProfileDto } from './dto/profile.dto'
import { SettingsDto } from './dto/settings.dto'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { CurrentUser } from 'src/common/decorators/current-user'
import { User } from './interfaces/user.interface'

@Controller({
  path: '/users',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const users = await this.usersService.findAll(query, { authUser })
      return new ResponseSuccess(
        'COMMON.SUCCESS',
        users.map((user) => new UserDto(user.toJSON()))
      )
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error)
    }
  }

  @Get('/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findById(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findById(params.id)
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user))
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error)
    }
  }

  @Get('/:email')
  @UseGuards(RolesGuard)
  @Roles('User')
  async findByEmail(@Param() params): Promise<IResponse> {
    try {
      const user = await this.usersService.findByEmail(params.email)
      return new ResponseSuccess('COMMON.SUCCESS', new UserDto(user))
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error)
    }
  }

  @Post('/profile/update')
  @UseGuards(RolesGuard)
  @Roles('User')
  async updateProfile(@Body() profileDto: ProfileDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateProfile(profileDto)
      return new ResponseSuccess('PROFILE.UPDATE_SUCCESS', new UserDto(user))
    } catch (error) {
      return new ResponseError('PROFILE.UPDATE_ERROR', error)
    }
  }

  @Post('settings/update')
  @UseGuards(RolesGuard)
  @Roles('User')
  async updateSettings(@Body() settingsDto: SettingsDto): Promise<IResponse> {
    try {
      const user = await this.usersService.updateSettings(settingsDto)
      return new ResponseSuccess('SETTINGS.UPDATE_SUCCESS', new UserDto(user))
    } catch (error) {
      return new ResponseError('SETTINGS.UPDATE_ERROR', error)
    }
  }
}
