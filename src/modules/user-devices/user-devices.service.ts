import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BaseService from 'src/base/base-service';
import { IUserDevice, UserDevice } from './interfaces/user-device.interface';

@Injectable()
export class UserDeviceService extends BaseService<UserDevice, IUserDevice> {
  constructor(@InjectModel('UserDevice') private readonly userDevice: Model<UserDevice>) {
    super(userDevice);
  }
}
