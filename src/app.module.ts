import { join } from 'path';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shops.module';
import { ServicesModule } from './modules/services/service.module';
import { ProductsModule } from './modules/products/products.module';
import { MulterModule } from '@nestjs/platform-express';
import { CustomersModule } from './modules/customers/customers.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

@Module({
  imports: [
    ConfigModule,

    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),

    MulterModule.register({
      dest: './uploads'
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads')
    }),

    // Custom Modules
    UsersModule,
    AuthModule,
    ShopsModule,
    ServicesModule,
    ProductsModule,
    CustomersModule,
    AppointmentsModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService]
})
export class AppModule {}
