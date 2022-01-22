import { MongooseModule } from '@nestjs/mongoose';
import { QuoteService } from './quote.service';
import { QuotesSchema } from './schemas/quotes.schema';
import { QuoteController } from './quote.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from 'src/common/middlewares/middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Quotes', schema: QuotesSchema }])],
  controllers: [QuoteController],
  providers: [QuoteService],
  exports: [QuoteService]
})
export class QuoteModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(QuoteController);
  }
}
