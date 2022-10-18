import * as mongoose from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, Type } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto, ShopQueryDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { Shop } from './interfaces/shop.interface';

@Controller({
  path: '/shops',
  version: '1'
})
// @UseGuards(AuthGuard('jwt'))
export class ShopsController {
  private logger: Logger;

  constructor(private readonly shopsService: ShopsService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(ShopsController.name);
  }

  @Post()
  async create(@Body() createShopDto: CreateShopDto) {
    try {
      const Shop = await this.shopsService.create(createShopDto);

      if (Shop) {
        return new ResponseSuccess('SHOP.CREATE', Shop);
      } else {
        return new ResponseError('SHOP.ERROR.CREATE_SHOP_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SHOP.ERROR.CREATE_SHOP_FAILED', error);
    }
  }

  @Get()
  async findAll(@Query() query: ShopQueryDto) {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.q) {
        filter = { name: { $regex: query.q, $options: 'i' } };
      }

      filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

      const ShopResponse = await this.shopsService.findAll(filter, { query });

      if (ShopResponse) {
        return new ResponseSuccess('SHOP.FILTER', ShopResponse);
      } else {
        return new ResponseError('SHOP.ERROR.FILTER_SHOP_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SHOP.ERROR.FILTER_SHOP_FAILED', error);
    }
  }

  @Get('/:shopId')
  async findOne(@Param('shopId') shopId: string) {
    try {
      const Shop = await this.shopsService.findOne({ _id: shopId });

      if (Shop) {
        return new ResponseSuccess('SHOP.FIND', Shop);
      } else {
        return new ResponseError('SHOP.ERROR.FIND_SHOP_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SHOP.ERROR.FIND_SHOP_FAILED', error);
    }
  }

  @Patch('/:shopId')
  async update(@Param('shopId') shopId: string, @Body() updateShopDto: UpdateShopDto) {
    try {
      const Shop = await this.shopsService.update(shopId, updateShopDto);

      if (Shop) {
        return new ResponseSuccess('SHOP.UPDATE', Shop);
      } else {
        return new ResponseError('SHOP.ERROR.UPDATE_SHOP_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SHOP.ERROR.UPDATE_SHOP_FAILED', error);
    }
  }

  @Delete('/:shopId')
  async remove(@Param('shopId') shopId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Shop;
      await session.withTransaction(async () => {
        removedItem = await this.shopsService.softDelete(shopId, session);
      });
      return new ResponseSuccess('SHOP.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('SHOP.ERROR.DELETE_SHOP_FAILED', error);
    }
  }
}
