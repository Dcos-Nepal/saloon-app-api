import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateShopDto, ShopQueryDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { IShop, Shop } from './interfaces/shop.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class ShopsService extends BaseService<Shop, IShop> {
  private logger: Logger;

  constructor(@InjectModel('Shop') private readonly ShopModel: Model<Shop>) {
    super(ShopModel);
    this.logger = new Logger(ShopsService.name);
  }

  /**
   * Create Shop
   *
   * @param createDto CreateShopDto
   * @returns Shop
   */
  async create(createDto: CreateShopDto) {
    this.logger.log(`Create: Create Shop `);

    const ShopData = new this.ShopModel(createDto);
    const shop = await ShopData.save();

    this.logger.log(`Create: Created Shop of ${shop._id} successfully `);

    return shop;
  }

  /**
   * Filter Shops based on the query strings
   *
   * @param query ShopQueryDto
   * @returns Shop[]
   */
  async filterShops(query: ShopQueryDto) {
    this.logger.log(`Filter: Fetch Shops, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Shops = await this.ShopModel.find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched Shops successfully`);

    return Shops;
  }

  /**
   * Update Shop with given update info
   *
   * @param id String
   * @param updateShopDto UpdateShopDto
   * @returns Shop
   */
  async update(id: string, updateShopDto: UpdateShopDto) {
    this.logger.log(`Update: Update Shop of id: ${id}`);

    const updatedShop = await this.ShopModel.findOneAndUpdate(
      { _id: id },
      {
        ...updateShopDto
      },
      { new: true }
    ).exec();

    if (!updatedShop) {
      throw new NotFoundException(`Shop with ${id} is not found`);
    }
    this.logger.log(`Update: updated Shop of id ${id} successfully`);

    return updatedShop;
  }
}
