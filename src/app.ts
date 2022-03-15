import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './common/redis-adapter';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomValidationPipe } from './common/pipes/validation-pipe';

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  // Uses Redis Adaptor
  app.useWebSocketAdapter(new RedisIoAdapter((<any>app).getHttpServer()));

  // Enable Shutdown Hooks
  app.enableShutdownHooks();

  // Uses Validation Pipes
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Add a route prefix 'api'
  app.setGlobalPrefix('api');

  // Versioning API using MEDIA_TYPE
  app.enableVersioning({
    type: VersioningType.URI
  });

  // Request Body Parser
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bodyParser = require('body-parser');

  // Add limitations to Request Body
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  // Apply Global Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // /* Start Security */
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later'
    })
  );

  const requestLimiter = (duration: number, maxRequest: number, message: string) =>
    rateLimit({
      windowMs: duration * 60 * 1000, // x(minute) hour window
      max: maxRequest, // start blocking after x requests
      message: message
    });

  // Apply request limit to user login/register API endpoint
  app.use('/auth/login', requestLimiter(5, 15, 'Too many login attempts from this IP, please try again after 5 minutes'));
  app.use('/auth/register', requestLimiter(20, 10, 'Too many register attempts from this IP, please try again after 20 minutes'));
  // /** End Security **/
  // Swagger Documentation
  const options = new DocumentBuilder()
    .setTitle('Orange Cleaning (AU) API')
    .setDescription('Orange Cleaning for workers, clients and admin.')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'Token' }, 'Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  return app;
}
