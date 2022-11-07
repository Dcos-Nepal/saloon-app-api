import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateOrderDto, OrderQueryDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IOrder, Order } from './interfaces/order.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class OrdersService extends BaseService<Order, IOrder> {
  private logger: Logger;

  constructor(@InjectModel('Order') private readonly OrderModel: Model<Order>) {
    super(OrderModel);
    this.logger = new Logger(OrdersService.name);
  }

  /**
   * Create Order
   *
   * @param createDto CreateOrderDto
   * @returns Order
   */
  async createOrder(createDto: CreateOrderDto) {
    this.logger.log(`Create: Create Order `);

    const OrderData = new this.OrderModel(createDto);
    const Order = await OrderData.save();

    this.logger.log(`Create: Created Order of ${Order._id} successfully `);

    return Order;
  }

  /**
   * Filter Orders based on the query strings
   *
   * @param query OrderQueryDto
   * @returns Order[]
   */
  async filterOrders(query: OrderQueryDto) {
    this.logger.log(`Filter: Fetch Orders, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Orders = await this.OrderModel.find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched Orders successfully`);

    return Orders;
  }

  /**
   * Update Order with given update info
   *
   * @param id String
   * @param updateOrderDto UpdateOrderDto
   * @returns Order
   */
  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(`Update: Update Order of id: ${id}`);

    const order: any = await this.OrderModel.findOne({ _id: id });

    if (order.status.name !== updateOrderDto.status.name) {
      order.prevStatus.push({
        name: order.status.name,
        date: order.status?.date || new Date(),
        reason: ''
      });
      order.status = {
        date: new Date(),
        name: updateOrderDto.status.name,
        reason: updateOrderDto.status.reason,
        duration: ''
      };
    }

    const updatedOrder = await order.save();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ${id} is not found`);
    }
    this.logger.log(`Update: updated Order of id ${id} successfully`);

    return updatedOrder;
  }
}
