import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { PropertiesService } from './properties.service';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Type, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { User } from '../users/interfaces/user.interface';
import { IResponse } from 'src/common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './interfaces/property.interface';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller({
  path: '/properties',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    // Remove pagination Query strings from filter
    delete filter?.limit;
    delete filter?.page;

    try {
      if (query.q) {
        filter = { name: { $regex: query.q, $options: 'i' } };
      }

      const properties = await this.propertiesService.findAll(filter, { authUser, query });
      return new ResponseSuccess('COMMON.SUCCESS', properties);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:propertyId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const property = await this.propertiesService.findById(param.propertyId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', property);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async create(@Body() property: CreatePropertyDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newProperty: Property;
      await session.withTransaction(async () => {
        newProperty = await this.propertiesService.create(property, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:propertyId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async update(@Param() param, @Body() property: UpdatePropertyDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedProperty: Property;
      await session.withTransaction(async () => {
        updatedProperty = await this.propertiesService.update(param.propertyId, property, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:propertyId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedProperty: boolean;
      await session.withTransaction(async () => {
        updatedProperty = <boolean>await this.propertiesService.remove(param.propertyId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedProperty);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
