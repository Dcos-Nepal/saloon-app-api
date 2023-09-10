import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shops.module';
import { ServicesModule } from './modules/services/service.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PackageClientsModule } from './modules/package-clients/package-clients.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule,

    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),

    // Custom Modules
    BookingsModule,
    UsersModule,
    AuthModule,
    ShopsModule,
    ServicesModule,
    ProductsModule,
    CustomersModule,
    PackageClientsModule,
    AppointmentsModule,
    OrdersModule,
    ReportsModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService]
})
export class AppModule {}
