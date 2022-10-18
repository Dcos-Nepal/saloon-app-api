import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShopSchema } from './schemas/shop.schema';

import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }])],
  controllers: [ShopsController],
  providers: [ShopsService]
})
export class ShopsModule {}
