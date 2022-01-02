import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

import NodeMailerHelper from './helpers/node-mailer-helper';
import { AppSocketGateway } from './app.socket';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LineItemsModule } from './modules/line-items/line-items.module';

@Module({
  imports: [
    ConfigModule,
    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),
    UsersModule,
    AuthModule,
    ChatModule,
    PropertiesModule,
    LineItemsModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService, AppSocketGateway, { provide: 'NodeMailer', useClass: NodeMailerHelper }]
})
export class AppModule {}
