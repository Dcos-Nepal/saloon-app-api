import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BaseService from 'src/base/base-service';
import { IProperty, Property } from './interfaces/property.interface';

@Injectable()
export class PropertiesService extends BaseService<Property, IProperty> {
  constructor(@InjectModel('Property') private readonly propertyModel: Model<Property>) {
    super(propertyModel);
  }
}
