import * as mongoose from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { diskStorage } from 'multer';
import { Res, Req, Controller, Post, Get, Query, Param, Patch, Delete, Body, Logger, Type, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, CustomerQueryDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';

import { Customer } from './interfaces/customer.interface';
import { AuthGuard } from '@nestjs/passport';
import { FileUploadDto } from './dto/file-upload.dto';
import { Helper } from 'src/common/utils/helper';

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
  @UseGuards(AuthGuard('jwt'))
  async createNewCustomer(@Body() createCustomerDto: CreateCustomerDto) {
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

  @Post('/:customerId/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: Helper.destinationPath,
      filename: Helper.customFileName
    }),
    fileFilter: Helper.imageFileFilter
  }))
  async savePhoto(@Req() req: any, @UploadedFile() file, @Param('customerId') customerId: string) {
    if (!file || req.fileValidationError) {
      return new ResponseError(`UPLOAD:CUSTOMER:PHOTO:ERROR: ${req.fileValidationError}`);
    }
    
    try {
      const customer: any = await this.customersService.findOne({ _id: customerId });
      const toUpdateCustomer = {...customer._doc, photo: file.filename};

      await this.customersService.update(customerId, toUpdateCustomer)

      if (toUpdateCustomer) {
        return new ResponseSuccess('CUSTOMER.PHOTO:SUCCESS', toUpdateCustomer);
      } else {
        return new ResponseError('CUSTOMER.ERROR.PHOTO_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.UPLOAD_IMAGES_CUSTOMER_FAILED', error);
    }
  }

  @Post('/:customerId/images')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: Helper.destinationPath,
      filename: Helper.customFileName
    }),
    fileFilter: Helper.imageFileFilter
  }))
  async uploadFile(@Req() req: any, @UploadedFile() file, @Param('customerId') customerId: string, @Body() fileUploadDto: FileUploadDto) {
    if (!file || req.fileValidationError) {
      return new ResponseError(`UPLOAD:CUSTOMER:PHOTO:ERROR: ${req.fileValidationError}`);
    }
    
    try {
      const customer: any = await this.customersService.findOne({ _id: customerId });

      // Now prepare the customer object to include images
      const prepFiles = {
        photo: file.filename,
        caption: fileUploadDto.caption,
        type:  fileUploadDto.type,
        date: new Date()
      };

      const toUpdateCustomer = {...customer._doc, photos: [...customer._doc.photos, prepFiles]};

      await this.customersService.update(customerId, toUpdateCustomer)

      if (toUpdateCustomer) {
        return new ResponseSuccess('CUSTOMER.UPLOAD_IMAGES', toUpdateCustomer);
      } else {
        return new ResponseError('CUSTOMER.ERROR.UPLOAD_IMAGES_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CUSTOMER.ERROR.UPLOAD_IMAGES_CUSTOMER_FAILED', error);
    }
  }

  @Get('/avatars/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    const fs = require('fs');
    const p = require('path');
    const dirPath = p.join(__dirname, '..', '..', '..', '/uploads/');
    const path = dirPath + fileId;

    if (fs.existsSync(path)) {
      console.log('file exists');
      return res.sendFile(fileId, { root: 'uploads' });
    }

    return res.sendStatus(404);
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
