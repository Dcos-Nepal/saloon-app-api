import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CustomerSchema } from '../customers/schemas/customer.schema';
import { ReportDownloadService } from './report-download.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportDownloadService]
})
export class ReportsModule {}
