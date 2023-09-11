import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

import BaseService from 'src/base/base-service';
import { IPackageClient, PackageClient } from './interfaces/package-client.interface';

@Injectable()
export class PackageClientsService extends BaseService<PackageClient, IPackageClient> {
  logger: Logger;

  constructor(@InjectModel('PackageClient') private readonly visitModel: Model<PackageClient>) {
    super(visitModel);
    this.logger = new Logger(PackageClientsService.name);
  }

  /**
   * Get PackageClients based on the provided filters
   *
   * @returns
   * @param query
   * @param shopId
   */
  async findPackageClients(query: any, shopId: string) {
    const filter = { isDeleted: false, shopId: { $eq: shopId } };

    if (query.q) {
      filter['customer.fullName'] = { $regex: query.q, $options: 'i' };
    }

    const limit = parseInt(query['limit'] || 10);
    const page = parseInt(query['page'] || 1);
    const skip = (page - 1) * limit;

    const sortOptions = query.sortBy || '-createdAt';

    const pipeline = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: '$customer'
      }
    ];

    const customersPromise = this.visitModel.aggregate(pipeline).match(filter).limit(limit).skip(skip).sort(sortOptions);
    const countPromise = this.visitModel.aggregate(pipeline).match(filter).count('count');

    const [rows, totalCount] = await Promise.all([customersPromise, countPromise]);

    return { rows, totalCount: totalCount[0].count };
  }
}
