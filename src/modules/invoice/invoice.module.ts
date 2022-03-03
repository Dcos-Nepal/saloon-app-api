import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceService } from './invoice-service';
import { InvoiceSchema } from './schemas/invoices.schema';
import { InvoiceController } from './invoice-controller';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserDevicesModule } from '../devices/devices.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Invoice', schema: InvoiceSchema }]), UserDevicesModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService]
})
export class InvoiceModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(InvoiceController);
  }
}
