import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { PropertiesService } from './properties.service';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { User } from '../users/interfaces/user.interface';
import { IResponse } from 'src/common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './interfaces/property.interface';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller({
  path: '/properties',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const properties = await this.propertiesService.findAll(query, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', properties);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Get('/:propertyId')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const property = await this.propertiesService.findById(param.propertyId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', property);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  async create(@Body() property: CreatePropertyDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newProperty: Property;
      await session.withTransaction(async () => {
        newProperty = await this.propertiesService.create(property, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', newProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Put('/:propertyId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdatePropertyDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedProperty: Property;
      await session.withTransaction(async () => {
        updatedProperty = await this.propertiesService.update(param.propertyId, property, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Delete('/:propertyId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async delete(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedProperty: boolean;
      await session.withTransaction(async () => {
        updatedProperty = await this.propertiesService.remove(param.propertyId, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }
}
