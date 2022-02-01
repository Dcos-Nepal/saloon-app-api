import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDeviceService } from './user-devices.service';
import { UserDevicesSchema } from './schemas/user-devices.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'UserDevice', schema: UserDevicesSchema }])],
  providers: [UserDeviceService],
  exports: [UserDeviceService]
})
export class UserDevicesModule {}
