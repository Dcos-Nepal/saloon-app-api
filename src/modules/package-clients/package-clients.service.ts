import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

import BaseService from 'src/base/base-service';
import { IServiceOptions } from 'src/common/interfaces';
import { PackageClient, IPackageClient } from './interfaces/package-client.interface';

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
   * @param filter
   * @param options
   * @returns
   */
  async findAll(filter: any, options?: IServiceOptions) {
    return super.findAll(filter, options);
  }
}
