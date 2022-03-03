import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDeviceService } from './devices.service';
import { UserDevicesSchema } from './schemas/devices.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'UserDevice', schema: UserDevicesSchema }])],
  controllers: [],
  providers: [UserDeviceService],
  exports: [UserDeviceService]
})
export class UserDevicesModule {}
