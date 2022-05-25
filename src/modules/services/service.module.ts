import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ServiceSchema } from './schemas/service.schema';

import { ServiceService } from './service.service';
import { ServicesController } from './service.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Service', schema: ServiceSchema }])],
  controllers: [ServicesController],
  providers: [ServiceService]
})
export class ServicesModule {}
