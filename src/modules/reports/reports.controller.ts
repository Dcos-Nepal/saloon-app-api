import { Controller, Get, Header, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';
import { ReportQueryDto } from './dto/reports.dto';
import { ReportDownloadService } from './report-download.service';
import { Response } from 'express';

@Controller({
  path: '/reports',
  version: '1'
})
export class ReportsController {
  private logger: Logger;

  constructor(private readonly reportsService: ReportsService, private readonly reportDownloadService: ReportDownloadService) {
    this.logger = new Logger(ReportsController.name);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@CurrentUser() authUser: User, @Query() query: ReportQueryDto) {
    try {
      const response = await this.reportsService.filterAppointmentsWithCustomer(authUser.shopId, query);

      if (response) {
        return new ResponseSuccess('REPORT.FILTER', response, true);
      } else {
        return new ResponseError('REPORT.ERROR.FILTER_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('REPORT.ERROR.FILTER_REPORT_FAILED', error);
    }
  }

  @Get('/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@CurrentUser() authUser: User, @Query() query: ReportQueryDto) {
    try {
      const response = await this.reportsService.getStats(authUser.shopId, query);

      if (response) {
        return new ResponseSuccess('REPORT.FILTER', response, true);
      } else {
        return new ResponseError('REPORT.ERROR.FILTER_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('REPORT.ERROR.FILTER_REPORT_FAILED', error);
    }
  }

  @Get('/download')
  @UseGuards(AuthGuard('jwt'))
  @Header('Content-Type', 'text/xlsx')
  async downloadReport(@CurrentUser() authUser: User, @Query() query: ReportQueryDto, @Res() response: Response) {
    try {
      const result = await this.reportDownloadService.downloadReport(authUser.shopId, query);

      if (result) {
        return response.download(<string>result);
      } else {
        return new ResponseError('REPORT.ERROR.FILTER_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('REPORT.ERROR.FILTER_REPORT_FAILED', error);
    }
  }
}
