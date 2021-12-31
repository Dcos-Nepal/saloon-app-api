import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppService } from './app.service'
import { SocketGateway } from './app.socket'
import { AppController } from './app.controller'

import { ConfigModule } from './configs/config.module'
import { ConfigService } from './configs/config.service'

import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import NodeMailerHelper from './helpers/node-mailer-helper'

@Module({
  imports: [
    ConfigModule,
    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService, SocketGateway, { provide: 'NodeMailer', useClass: NodeMailerHelper }]
})
export class AppModule {}
