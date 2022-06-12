import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Type, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { InvoiceService } from './invoice-service';
import { InjectConnection } from '@nestjs/mongoose';
import { IInvoice, Invoice } from './interfaces/invoice.interface';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';
import { GetInvoiceQueryDto } from './dtos/get-invoice-query.dto';
import { IResponse } from 'src/common/interfaces/response.interface';
import { UpdateInvoiceDto } from './dtos/update-invoice.dto';
import { NotificationPayload, UserDeviceService } from '../devices/devices.service';
import { NotificationService } from '../notifications/notification.service';

@Controller({
  path: '/invoices',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class InvoiceController {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly deviceService: UserDeviceService,
    private readonly invoiceService: InvoiceService,
    private readonly notifyService: NotificationService
  ) {}

  @Get('/summary')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async getSummary(@Query() query): Promise<IResponse> {
    const filter: mongoose.FilterQuery<Invoice> = {};

    if (query?.invoiceFor) {
      filter.invoiceFor = { $eq: query.invoiceFor };
    }

    try {
      const summary = await this.invoiceService.getSummary(filter);

      return new ResponseSuccess('COMMON.SUCCESS', summary);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get()
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async find(@Query() query: GetInvoiceQueryDto, @CurrentUser() authUser: User) {
    let filter: mongoose.FilterQuery<Type> = {};

    try {
      // Filters to listing Job Requests
      if (query.q) {
        filter = { subject: { $regex: query.q, $options: 'i' }, isDeleted: false };
      }

      if (query.invoiceFor) {
        filter = { invoiceFor: { $eq: query.invoiceFor } };
      }

      if (query.createdBy) {
        filter = { createdBy: { $eq: query.createdBy } };
      }

      filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

      const toPopulate = [{ path: 'invoiceFor', select: ['firstName', 'lastName', 'email', 'phoneNumber', 'address'] }];
      const options = { authUser, query, toPopulate };
      const invoices = await this.invoiceService.findAll(filter, options);
      return new ResponseSuccess('COMMON.SUCCESS', invoices);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:id')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
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
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async create(@Body() invoice: CreateInvoiceDto, @CurrentUser() authUser: User) {
    // Add Created by Id
    invoice.createdBy = authUser._id;

    try {
      const session = await this.connection.startSession();
      let newInvoice: Invoice;
      await session.withTransaction(async () => {
        newInvoice = await this.invoiceService.create(invoice, session, { authUser });
      });
      session.endSession();

      // Send Notification to Client
      await this.notifyService.create({
        title: 'Visit Invoice Created!',
        description: `A Visit Invoice of ref. #${newInvoice.refCode} has been created.`,
        receiver: newInvoice.invoiceFor as string,
        type: 'Visit Invoice'
      });

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'An Invoice Created!',
          body: `An invoice of ref. #${newInvoice.refCode} created for you.`
        },
        mobileData: {
          type: 'INVOICE_CREATED',
          routeName: '/invoices',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof newInvoice.invoiceFor === 'string' ? newInvoice.invoiceFor : newInvoice?.invoiceFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', newInvoice.toJSON());
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post(':invoiceId/send')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async sendInvoice(@Param() param) {
    try {
      const session = await this.connection.startSession();
      let invoice: Invoice;
      await session.withTransaction(async () => {
        invoice = await this.invoiceService.sendInvoice(param.invoiceId, session);
      });
      session.endSession();

      // Send Notification to Client
      await this.notifyService.create({
        title: 'Visit Invoice Received!',
        description: `A Visit Invoice of ref. #${invoice.refCode} has been received.`,
        receiver: invoice.invoiceFor as string,
        type: 'Visit Invoice'
      });

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Invoice Received!',
          body: `An invoice of ref. #${invoice.refCode} received for payment.`
        },
        mobileData: {
          type: 'INVOICE_RECEIVED',
          routeName: '/invoices',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof invoice.invoiceFor === 'string' ? invoice.invoiceFor : invoice?.invoiceFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', invoice);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:invoiceId')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
  @UseGuards(RolesGuard)
  async update(@Param() param, @Body() invoiceUpdateDto: UpdateInvoiceDto): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedInvoice: IInvoice;
      await session.withTransaction(async () => {
        updatedInvoice = await this.invoiceService.update(param.invoiceId, invoiceUpdateDto, session);
      });
      session.endSession();

      // Send Notification to Client
      await this.notifyService.create({
        title: 'Visit Invoice Updated!',
        description: `A Visit Invoice of ref. #${updatedInvoice.refCode} has been updated.`,
        receiver: updatedInvoice.invoiceFor as string,
        type: 'Visit Invoice'
      });

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Invoice Updated!',
          body: `An invoice of ref. #${updatedInvoice.refCode} updated recently.`
        },
        mobileData: {
          type: 'INVOICE_UPDATED',
          routeName: '/invoices',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(
        typeof updatedInvoice.invoiceFor === 'string' ? updatedInvoice.invoiceFor : updatedInvoice?.invoiceFor?._id,
        notificationPayload
      );

      return new ResponseSuccess('COMMON.SUCCESS', updatedInvoice);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:invoiceId')
  @Roles('ADMIN', 'CLIENT', 'WORKER')
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
