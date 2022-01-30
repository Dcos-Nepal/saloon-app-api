import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

import { AppSocketGateway } from './app.socket';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LineItemsModule } from './modules/line-items/line-items.module';
import { JobRequestModule } from './modules/job-request/job-request.module';
import { QuoteModule } from './modules/quotes/quotes.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { VisitsModule } from './modules/visits/visits.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AWSModule } from './common/modules/aws/aws.module';
import { FilesModule } from './common/modules/files/files.module';

@Module({
  imports: [
    ConfigModule,
    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),
    // Common Modules
    AWSModule,
    FilesModule,

    // Custom Modules
    UsersModule,
    AuthModule,
    ChatModule,
    PropertiesModule,
    LineItemsModule,
    JobRequestModule,
    QuoteModule,
    JobsModule,
    VisitsModule,
    InvoiceModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService, AppSocketGateway]
})
export class AppModule {}
