import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards, Type } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto, ServiceQueryDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Service } from './interfaces/service.interface';

@Controller({
  path: '/services',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class ServicesController {
  private logger: Logger;

  constructor(private readonly serviceService: ServiceService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(ServicesController.name);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@Body() createServiceDto: CreateServiceDto) {
    try {
      const Service = await this.serviceService.create(createServiceDto);

      if (Service) {
        return new ResponseSuccess('SERVICE.CREATE', Service);
      } else {
        return new ResponseError('SERVICE.ERROR.CREATE_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SERVICE.ERROR.CREATE_SERVICE_FAILED', error);
    }
  }

  @Get()
  async findAll(@Query() query: ServiceQueryDto) {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.q) {
        filter = { name: { $regex: query.q, $options: 'i' } };
      }

      filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

      const ServicesResponse = await this.serviceService.findAll(filter, { query });

      if (ServicesResponse) {
        return new ResponseSuccess('SERVICE.FILTER', ServicesResponse);
      } else {
        return new ResponseError('SERVICE.ERROR.FILTER_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SERVICE.ERROR.FILTER_SERVICE_FAILED', error);
    }
  }

  @Get('/:serviceId')
  async findOne(@Param('serviceId') serviceId: string) {
    try {
      const Service = await this.serviceService.findOne({ _id: serviceId });

      if (Service) {
        return new ResponseSuccess('SERVICE.FIND', Service);
      } else {
        return new ResponseError('SERVICE.ERROR.FIND_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SERVICE.ERROR.FIND_SERVICE_FAILED', error);
    }
  }

  @Patch('/:serviceId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async update(@Param('serviceId') serviceId: string, @Body() updateServiceDto: UpdateServiceDto) {
    try {
      const Service = await this.serviceService.update(serviceId, updateServiceDto);

      if (Service) {
        return new ResponseSuccess('SERVICE.UPDATE', Service);
      } else {
        return new ResponseError('SERVICE.ERROR.UPDATE_SERVICE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SERVICE.ERROR.UPDATE_SERVICE_FAILED', error);
    }
  }

  @Delete('/:serviceId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async remove(@Param('serviceId') serviceId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Service;
      await session.withTransaction(async () => {
        removedItem = await this.serviceService.softDelete(serviceId, session);
      });
      return new ResponseSuccess('SERVICE.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SERVICE.ERROR.DELETE_SERVICE_FAILED', error);
    }
  }
}
