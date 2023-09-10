import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';

import { User } from '../users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { IResponse } from 'src/common/interfaces/response.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { CreatePackageClientDto } from './dto/create-package-client.dto';
import { UpdatePackageClientDto } from './dto/update-package-client.dto';
import { PackageClient, IPackageClient } from './interfaces/package-client.interface';
import { PackageClientsService } from './package-clients.service';

@Controller({
  path: '/package-clients',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class PackageClientsController {
  constructor(@InjectConnection() private readonly connection: mongoose.Connection, private readonly packageClientService: PackageClientsService) {}

  @Get()
  async find(@CurrentUser() authUser: User, @Query() query): Promise<IResponse> {
    const filter: mongoose.FilterQuery<PackageClient> = { ...query };
    // Get only not deleted packageClients
    filter.isDeleted = false;

    if (query.q) {
      filter.title = { $regex: query.q, $options: 'i' };
    }

    // Default Filter
    filter['shopId'] = { $eq: authUser.shopId };

    const toPopulate = [
      { path: 'customer', select: ['fullName', 'firstName', 'lastName', 'phoneNumber', 'photo', 'dateOfBirth', 'gender', 'createdAt', 'address'] }
    ];

    try {
      const packageClients = await this.packageClientService.findAll(filter, { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', packageClients);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:packageClientId')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const packageClient = await this.packageClientService.findById(param.packageClientId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', packageClient);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  async create(@CurrentUser() authUser: User, @Body() packageClient: CreatePackageClientDto): Promise<IResponse> {
    // Set Shop ID for Packaged Client
    packageClient.shopId = authUser.shopId;

    try {
      const session = await this.connection.startSession();
      let newJob: IPackageClient;
      await session.withTransaction(async () => {
        newJob = await this.packageClientService.create(packageClient as IPackageClient, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newJob);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:packageClientId')
  async update(@Param() param, @Body() packageClient: UpdatePackageClientDto, @Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      let updatedPackageClient: IPackageClient;
      const session = await this.connection.startSession();

      await session.withTransaction(async () => {
        updatedPackageClient = await this.packageClientService.update(param.packageClientId, packageClient, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', updatedPackageClient);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:packageClientId')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedPackageClient: PackageClient;
      await session.withTransaction(async () => {
        deletedPackageClient = await this.packageClientService.softDelete(param.packageClientId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', !!deletedPackageClient);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
