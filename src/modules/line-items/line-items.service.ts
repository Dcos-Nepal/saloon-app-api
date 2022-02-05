import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateLineItemDto, LineItemQueryDto } from './dto/create-line-item.dto';
import { UpdateLineItemDto } from './dto/update-line-item.dto';
import { ILineItem, LineItem } from './interfaces/line-item.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class LineItemsService extends BaseService<LineItem, ILineItem> {
  private logger: Logger;

  constructor(@InjectModel('LineItem') private readonly lineItemModel: Model<LineItem>) {
    super(lineItemModel);
    this.logger = new Logger(LineItemsService.name);
  }

  /**
   * Create Line Item
   *
   * @param createDto CreateLineItemDto
   * @returns LineItem
   */
  async create(createDto: CreateLineItemDto) {
    this.logger.log(`Create: Create line item `);

    const lineItemData = new this.lineItemModel(createDto);
    const lineItem = await lineItemData.save();

    this.logger.log(`Create: Created line item of ${lineItem._id} successfully `);

    return lineItem;
  }

  /**
   * Filter line items based on the query strings
   *
   * @param query LineItemQueryDto
   * @returns LineItem[]
   */
  async filterLineItems(query: LineItemQueryDto) {
    this.logger.log(`Filter: Fetch line items, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const lineItems = await this.lineItemModel
      .find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched line items successfully`);

    return lineItems;
  }

  /**
   * Update Line Item with given update info
   *
   * @param id String
   * @param updateLineItemDto UpdateLineItemDto
   * @returns LineItem
   */
  async update(id: string, updateLineItemDto: UpdateLineItemDto) {
    this.logger.log(`Update: Update line item of id: ${id}`);

    const updatedLineItem = await this.lineItemModel
      .findOneAndUpdate(
        { _id: id },
        {
          ...updateLineItemDto
        },
        { new: true }
      )
      .exec();

    if (!updatedLineItem) {
      throw new NotFoundException(`Line item with ${id} is not found`);
    }
    this.logger.log(`Update: updated line item of id ${id} successfully`);

    return updatedLineItem;
  }
}
