import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { InvoiceService } from './invoice-service';
import { InjectConnection } from '@nestjs/mongoose';
import { Invoice } from './interfaces/invoice.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';
import { GetInvoiceQueryDto } from './dtos/get-invoice-query.dto';
import { IResponse } from 'src/common/interfaces/response.interface';

@Controller({
  path: '/invoices',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async find(@Query() query: GetInvoiceQueryDto, @CurrentUser() authUser: User) {
    try {
      const toPopulate = [{ path: 'invoiceFor', select: ['firstName', 'lastName', 'email', 'phoneNumber', 'address'] }];
      const invoices = await this.invoiceService.findAll(query, { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', invoices);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:id')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async findOne(@Param() id: string, @Query() query: GetInvoiceQueryDto, @CurrentUser() authUser: User) {
    try {
      const toPopulate = [{ path: 'invoiceFor', select: ['firstName', 'lastName', 'address', 'email', 'phoneNumber'] }];
      const invoice = await this.invoiceService.findById(new mongoose.Types.ObjectId(id).toString(), { authUser, query, toPopulate });
      return new ResponseSuccess('COMMON.SUCCESS', invoice);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@Body() invoice: CreateInvoiceDto, @CurrentUser() authUser: User) {
    try {
      const session = await this.connection.startSession();
      let newInvoice: Invoice;
      await session.withTransaction(async () => {
        newInvoice = await this.invoiceService.create(invoice, session, { authUser });
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', newInvoice.toJSON());
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post(':invoiceId/send')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async sendInvoice(@Param() param) {
    try {
      const session = await this.connection.startSession();
      let invoice: Invoice;
      await session.withTransaction(async () => {
        invoice = await this.invoiceService.sendInvoice(param.invoiceId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', invoice);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:invoiceId')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let isDeleted: boolean;
      await session.withTransaction(async () => {
        isDeleted = await this.invoiceService.remove(param.invoiceId, session);
      });
      session.endSession();

      return new ResponseSuccess('COMMON.SUCCESS', { isDeleted });
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
