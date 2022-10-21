import * as mongoose from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Res, Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, Type, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, CustomerQueryDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';

import { Customer } from './interfaces/customer.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: '/customers',
  version: '1'
})
export class CustomersController {
  private logger: Logger;

  constructor(private readonly customersService: CustomersService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(CustomersController.name);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
        return cb(null, `${randomName}${extname(file.originalname)}`)
      }
    })
  }))
  @UseGuards(AuthGuard('jwt'))
  async createNewCustomer(@UploadedFile() file, @Body() createCustomerDto: CreateCustomerDto) {
    // Creating file path
    createCustomerDto.photo = `${file.filename}`;

    try {
      const customer = await this.customersService.create(createCustomerDto);

      if (customer) {
        return new ResponseSuccess('CUSTOMER.CREATE', customer);
      } else {
        return new ResponseError('CUSTOMER.ERROR.CREATE_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.CREATE_CUSTOMER_FAILED', error);
    }
  }

  @Get('/avatars/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: 'uploads' });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: CustomerQueryDto) {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.q) {
        filter = { fullName: { $regex: query.q, $options: 'i' } };
      }

      filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

      const customerResponse = await this.customersService.findAll(filter, { query });

      if (customerResponse) {
        return new ResponseSuccess('CUSTOMER.FILTER', customerResponse);
      } else {
        return new ResponseError('CUSTOMER.ERROR.FILTER_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.FILTER_CUSTOMER_FAILED', error);
    }
  }

  @Get('/:customerId')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('customerId') customerId: string) {
    try {
      const customer = await this.customersService.findOne({ _id: customerId });

      if (customer) {
        return new ResponseSuccess('CUSTOMER.FIND', customer);
      } else {
        return new ResponseError('CUSTOMER.ERROR.FIND_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.FIND_CUSTOMER_FAILED', error);
    }
  }

  @Patch('/:customerId')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('customerId') customerId: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.customersService.update(customerId, updateCustomerDto);

      if (customer) {
        return new ResponseSuccess('CUSTOMER.UPDATE', customer);
      } else {
        return new ResponseError('CUSTOMER.ERROR.UPDATE_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.UPDATE_CUSTOMER_FAILED', error);
    }
  }

  @Delete('/:customerId')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('customerId') customerId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Customer;
      await session.withTransaction(async () => {
        removedItem = await this.customersService.softDelete(customerId, session);
      });
      return new ResponseSuccess('CUSTOMER.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.DELETE_CUSTOMER_FAILED', error);
    }
  }
}
