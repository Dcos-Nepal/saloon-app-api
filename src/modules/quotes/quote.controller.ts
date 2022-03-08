import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { QuoteService } from './quote.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Quote } from './interfaces/quote.interface';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { User } from '../users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { SelfOrAdminGuard } from '../auth/guards/permission.guard';
import { UpdateQuoteStatusDto } from './dto/update-quote-status-dto';
import { IResponse } from 'src/common/interfaces/response.interface';
import { Roles, SelfKey } from 'src/common/decorators/roles.decorator';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Type, UseGuards, UseInterceptors } from '@nestjs/common';
import { NotificationPayload, UserDeviceService } from '../devices/devices.service';

@Controller({
  path: '/quotes',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class QuoteController {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly deviceService: UserDeviceService,
    private readonly quoteService: QuoteService
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    if (query.q) {
      filter = { title: { $regex: query.q, $options: 'i' } };
    }

    try {
      const populate = [
        { path: 'quoteFor', select: ['firstName', 'lastName', 'email', 'phoneNumber'] },
        { path: 'property', select: ['name', 'street1', 'street2', 'city', 'state', 'postalCode', 'country', 'user', 'isDeleted'] }
      ];

      const quotes = await this.quoteService.findAll(filter, { authUser, query, toPopulate: populate });
      return new ResponseSuccess('COMMON.SUCCESS', quotes);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/summary')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  async getSummary(): Promise<IResponse> {
    try {
      const summary = await this.quoteService.getSummary();
      return new ResponseSuccess('COMMON.SUCCESS', summary);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Get('/:quoteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const populate = [
        { path: 'quoteFor', select: ['firstName', 'lastName', 'email', 'phoneNumber', 'address'] },
        { path: 'property', select: ['name', 'street1', 'street2', 'city', 'state', 'postalCode', 'country', 'user', 'isDeleted'] }
      ];
      const quote = await this.quoteService.findById(param.quoteId, { authUser, toPopulate: populate });
      return new ResponseSuccess('COMMON.SUCCESS', quote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'WORKER')
  // @UseGuards(SelfOrAdminGuard)
  // @SelfKey('quoteFor')
  async create(@Body() quote: CreateQuoteDto, @CurrentUser() authUser: User): Promise<IResponse> {
    // Add Created by Id
    quote.createdBy = authUser._id;

    try {
      const session = await this.connection.startSession();
      let newQuote: Quote;
      await session.withTransaction(async () => {
        newQuote = await this.quoteService.create(quote, session, { authUser });
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Quote Created!',
          body: `A job quote of ref. #${newQuote.refCode} created for you.`
        },
        mobileData: {
          type: 'JOB_QUOTE_CREATED',
          routeName: '/quotes',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof newQuote.quoteFor === 'string' ? newQuote.quoteFor : newQuote.quoteFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', newQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:quoteId')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  // @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() updatedQuoteDto: UpdateQuoteDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedQuote: Quote;
      await session.withTransaction(async () => {
        updatedQuote = await this.quoteService.update(param.quoteId, updatedQuoteDto, session, { authUser });
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Quote Updated!',
          body: `A job quote of ref. #${updatedQuote.refCode} recently.`
        },
        mobileData: {
          type: 'JOB_QUOTE_UPDATED',
          routeName: '/quotes',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof updatedQuote.quoteFor === 'string' ? updatedQuote.quoteFor : updatedQuote.quoteFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', updatedQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Put('/:quoteId/update-status')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  // @UseGuards(SelfOrAdminGuard)
  // @SelfKey('quoteFor')
  async updateStatus(@CurrentUser() authUser: User, @Param() param, @Body() quote: UpdateQuoteStatusDto): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedQuote: Quote;
      await session.withTransaction(async () => {
        updatedQuote = await this.quoteService.updateStatus(param.quoteId, quote.status, quote.reason || '', session, { authUser });
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Quote Status Changed!',
          body: `A job quote of ref. #${updatedQuote.refCode}'s status changed.`
        },
        mobileData: {
          type: 'JOB_QUOTE_STATUS_CHANGED',
          routeName: '/quotes',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof updatedQuote.quoteFor === 'string' ? updatedQuote.quoteFor : updatedQuote.quoteFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', updatedQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }

  @Delete('/:quoteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param() param): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedQuote: Quote;
      await session.withTransaction(async () => {
        deletedQuote = await this.quoteService.softDelete(param.quoteId, session);
      });
      session.endSession();

      // Notify Client via Push Notification:
      const notificationPayload: NotificationPayload = {
        notification: {
          title: 'Job Quote Deleted!',
          body: `A job quote of ref. #${deletedQuote.refCode} deleted recently.`
        },
        mobileData: {
          type: 'JOB_QUOTE_DELETED',
          routeName: '/quotes',
          metaData: '',
          click_action: 'APP_NOTIFICATION_CLICK'
        }
      };
      this.deviceService.sendNotification(typeof deletedQuote.quoteFor === 'string' ? deletedQuote.quoteFor : deletedQuote.quoteFor?._id, notificationPayload);

      return new ResponseSuccess('COMMON.SUCCESS', deletedQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error.toString());
    }
  }
}
