import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { InvoiceService } from './invoice-service';
import { InjectConnection } from '@nestjs/mongoose';
import { Invoice } from './interfaces/invoice.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';
import { GetInvoiceQueryDto } from './dtos/get-invoice-query.dto';

@Controller({
  path: '/invoices',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async find(@Query() query: GetInvoiceQueryDto, @CurrentUser() authUser: User) {
    try {
      const invoices = await this.invoiceService.findAll(query, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', invoices);
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
      return new ResponseSuccess('COMMON.SUCCESS', invoice);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
