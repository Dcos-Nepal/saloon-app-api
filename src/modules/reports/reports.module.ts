import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportDownloadService } from './report-download.service';
import { AppointmentSchema } from '../appointments/schemas/appointment.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Appointment', schema: AppointmentSchema }])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportDownloadService]
})
export class ReportsModule {}
