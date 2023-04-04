import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards, Type } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Product } from './interfaces/product.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';

@Controller({
  path: '/products',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  private logger: Logger;

  constructor(private readonly ProductsService: ProductsService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(ProductsController.name);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@CurrentUser() authUser: User, @Body() createProductDto: CreateProductDto) {
    // Set Shop ID for Packaged Client
    createProductDto.shopId = authUser.shopId;

    try {
      const Product = await this.ProductsService.create(createProductDto);

      if (Product) {
        return new ResponseSuccess('PRODUCT.CREATE', Product);
      } else {
        return new ResponseError('PRODUCT.ERROR.CREATE_PRODUCT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('PRODUCT.ERROR.CREATE_PRODUCT_FAILED', error);
    }
  }

  @Get()
  async findAll(@CurrentUser() authUser: User, @Query() query: ProductQueryDto) {
    let filter: mongoose.FilterQuery<Type> = { ...query };

    try {
      if (query.q) {
        filter = { name: { $regex: query.q, $options: 'i' } };
      }

      filter['$or'] = [{ isDeleted: false }, { isDeleted: null }, { isDeleted: undefined }];

      // Default Filter
      filter['shopId'] = { $eq: authUser.shopId };

      const ProductResponse = await this.ProductsService.findAll(filter, { query });

      if (ProductResponse) {
        return new ResponseSuccess('PRODUCT.FILTER', ProductResponse);
      } else {
        return new ResponseError('PRODUCT.ERROR.FILTER_PRODUCT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('PRODUCT.ERROR.FILTER_PRODUCT_FAILED', error);
    }
  }

  @Get('/:productId')
  async findOne(@Param('productId') productId: string) {
    try {
      const Product = await this.ProductsService.findOne({ _id: productId });

      if (Product) {
        return new ResponseSuccess('PRODUCT.FIND', Product);
      } else {
        return new ResponseError('PRODUCT.ERROR.FIND_PRODUCT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('PRODUCT.ERROR.FIND_PRODUCT_FAILED', error);
    }
  }

  @Patch('/:productId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async update(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      const Product = await this.ProductsService.update(productId, updateProductDto);

      if (Product) {
        return new ResponseSuccess('PRODUCT.UPDATE', Product);
      } else {
        return new ResponseError('PRODUCT.ERROR.UPDATE_PRODUCT_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('PRODUCT.ERROR.UPDATE_PRODUCT_FAILED', error);
    }
  }

  @Delete('/:productId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async remove(@Param('productId') productId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: Product;
      await session.withTransaction(async () => {
        removedItem = await this.ProductsService.softDelete(productId, session);
      });
      return new ResponseSuccess('PRODUCT.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('PRODUCT.ERROR.DELETE_PRODUCT_FAILED', error);
    }
  }
}
