import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LineItemSchema } from './schemas/line-item.schema';

import { LineItemsService } from './line-items.service';
import { LineItemsController } from './line-items.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'LineItem', schema: LineItemSchema }])],
  controllers: [LineItemsController],
  providers: [LineItemsService]
})
export class LineItemsModule {}
