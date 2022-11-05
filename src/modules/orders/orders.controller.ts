import * as mongoose from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards, Type } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { CreateOrderDto, OrderQueryDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './interfaces/order.interface';

@Controller({
  path: '/orders',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  private logger: Logger;

  constructor(private readonly ordersService: OrdersService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(OrdersController.name);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const Order = await this.ordersService.createOrder(createOrderDto);

      if (Order) {
        return new ResponseSuccess('ORDER.CREATE', Order);
      } else {
        return new ResponseError('ORDER.ERROR.CREATE_ORDER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('ORDER.ERROR.CREATE_ORDER_FAILED', error);
    }
  }

  @Get()
  async findAll(@Query() query: OrderQueryDto) {
    const filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.orderDate) {
        filter.orderDate = { $eq: query.orderDate };
      }

      if (query.status) {
        filter['status.name'] = query.status.toString();
      }

      filter['$or'] = [{ isDeleted: false }];

      // Remove unnecessary fields
      delete filter.status;

      const toPopulate = [{ path: 'customer', select: ['fullName', 'firstName', 'lastName', 'address', 'phoneNumber', 'email', 'photo'] }];
      const orderResponse = await this.ordersService.findAll(filter, { query, toPopulate });

      let rowsCount = 0;
      if (query.q) {
        orderResponse.rows = orderResponse.rows.filter((row) => {
          if ((row.customer as any).fullName.includes(query.q)) {
            rowsCount += 1;
            return true;
          }
          return false;
        });
      }

      if (orderResponse) {
        orderResponse.totalCount - rowsCount;
        return new ResponseSuccess('ORDER.FILTER', orderResponse);
      } else {
        return new ResponseError('ORDER.ERROR.FILTER_ORDER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('ORDER.ERROR.FILTER_ORDER_FAILED', error);
    }
  }

  @Get('/:orderId')
  async findOne(@Param('orderId') orderId: string) {
    try {
      const Order = await this.ordersService.findOne({ _id: orderId });

      if (Order) {
        return new ResponseSuccess('ORDER.FIND', Order);
      } else {
        return new ResponseError('ORDER.ERROR.FIND_ORDER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('ORDER.ERROR.FIND_ORDER_FAILED', error);
    }
  }

  @Patch('/:orderId')
  async update(@Param('orderId') orderId: string, @Body() updateOrderDto: UpdateOrderDto) {
    try {
      const Order = await this.ordersService.updateOrder(orderId, updateOrderDto);

      if (Order) {
        return new ResponseSuccess('ORDER.UPDATE', Order);
      } else {
        return new ResponseError('ORDER.ERROR.UPDATE_ORDER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('ORDER.ERROR.UPDATE_ORDER_FAILED', error);
    }
  }

  @Delete('/:orderId')
  async remove(@Param('orderId') orderId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Order;
      await session.withTransaction(async () => {
        removedItem = await this.ordersService.softDelete(orderId, session);
      });
      return new ResponseSuccess('ORDER.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('ORDER.ERROR.DELETE_ORDER_FAILED', error);
    }
  }
}
