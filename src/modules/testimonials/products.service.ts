import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CreateProductDto, ProductQueryDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IProduct, Product } from './interfaces/product.interface';
import BaseService from 'src/base/base-service';

@Injectable()
export class ProductsService extends BaseService<Product, IProduct> {
  private logger: Logger;

  constructor(@InjectModel('Product') private readonly ProductModel: Model<Product>) {
    super(ProductModel);
    this.logger = new Logger(ProductsService.name);
  }

  /**
   * Create Product
   *
   * @param createDto CreateProductDto
   * @returns Product
   */
  async create(createDto: CreateProductDto) {
    this.logger.log(`Create: Create Product `);

    const ProductData = new this.ProductModel(createDto);
    const Product = await ProductData.save();

    this.logger.log(`Create: Created Product of ${Product._id} successfully `);

    return Product;
  }

  /**
   * Filter Products based on the query strings
   *
   * @param query ProductQueryDto
   * @returns Product[]
   */
  async filterProducts(query: ProductQueryDto) {
    this.logger.log(`Filter: Fetch Products, set query payload `);

    const sortQuery = {};
    const dataQuery = {};
    const { q, isActive = true, isDeleted = false, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (q) dataQuery['name'] = { $regex: q, $options: 'i' };

    const Products = await this.ProductModel.find({ ...dataQuery, isActive: isActive, isDeleted: isDeleted })
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`Filter: Fetched Products successfully`);

    return Products;
  }

  /**
   * Update Product with given update info
   *
   * @param id String
   * @param updateProductDto UpdateProductDto
   * @returns Product
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    this.logger.log(`Update: Update Product of id: ${id}`);

    const updatedProduct = await this.ProductModel.findOneAndUpdate(
      { _id: id },
      {
        ...updateProductDto
      },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ${id} is not found`);
    }
    this.logger.log(`Update: updated Product of id ${id} successfully`);

    return updatedProduct;
  }
}
