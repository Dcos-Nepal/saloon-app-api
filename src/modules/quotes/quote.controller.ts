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
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';

@Controller({
  path: '/quotes',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService, @InjectConnection() private readonly connection: mongoose.Connection) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async find(@Query() query, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const quotes = await this.quoteService.findAll(query, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', quotes);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Get('/:quoteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  async findById(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const quote = await this.quoteService.findById(param.quoteId, { authUser });
      return new ResponseSuccess('COMMON.SUCCESS', quote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('quoteFor')
  async create(@Body() quote: CreateQuoteDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let newQuote: Quote;
      await session.withTransaction(async () => {
        newQuote = await this.quoteService.create(quote, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', newQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Put('/:quoteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  async update(@Param() param, @Body() property: UpdateQuoteDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedQuote: Quote;
      await session.withTransaction(async () => {
        updatedQuote = await this.quoteService.update(param.quoteId, property, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Put('/:quoteId/update-status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(SelfOrAdminGuard)
  @SelfKey('quoteFor')
  async updateStatus(@Param() param, @Body() quote: UpdateQuoteStatusDto, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let updatedQuote: Quote;
      await session.withTransaction(async () => {
        updatedQuote = await this.quoteService.updateStatus(param.quoteId, quote.status, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', updatedQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }

  @Delete('/:quoteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async delete(@Param() param, @CurrentUser() authUser: User): Promise<IResponse> {
    try {
      const session = await this.connection.startSession();
      let deletedQuote: boolean;
      await session.withTransaction(async () => {
        deletedQuote = await this.quoteService.remove(param.quoteId, session, { authUser });
      });
      return new ResponseSuccess('COMMON.SUCCESS', deletedQuote);
    } catch (error) {
      return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
    }
  }
}
