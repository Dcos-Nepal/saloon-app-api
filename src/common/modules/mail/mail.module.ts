import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from 'src/configs/config.module';
import { ConfigService } from 'src/configs/config.service';
import * as AWS from 'aws-sdk';

@Global() // 👈 optional to make module global
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        console.log(config.getAWSConfig());
        console.log(config.getMailConfig());
        return {
          transport: {
            SES: new AWS.SES({
              accessKeyId: config.getAWSConfig().AWS_ACCESS_KEY_ID,
              secretAccessKey: config.getAWSConfig().AWS_SECRET_ACCESS_KEY,
              region: config.getAWSConfig().AWS_SES_REGION
            })
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true
            }
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
