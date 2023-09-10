import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user';
import { User } from '../users/interfaces/user.interface';
import { ReportQueryDto } from './dto/reports.dto';

@Controller({
  path: '/reports',
  version: '1'
})
export class ReportsController {
  private logger: Logger;

  constructor(private readonly customersService: ReportsService) {
    this.logger = new Logger(ReportsController.name);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@CurrentUser() authUser: User, @Query() query: ReportQueryDto) {
    try {
      const customerResponse = await this.customersService.filterCustomersWithAppointments(authUser.shopId, query);

      if (customerResponse) {
        return new ResponseSuccess('REPORT.FILTER', customerResponse);
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
      const response = await this.customersService.getStats(authUser.shopId, query);

      if (response) {
        return new ResponseSuccess('REPORT.FILTER', response);
      } else {
        return new ResponseError('REPORT.ERROR.FILTER_CUSTOMER_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('REPORT.ERROR.FILTER_REPORT_FAILED', error);
    }
  }
}
