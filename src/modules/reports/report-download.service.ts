import { Injectable, Logger } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/reports.dto';
import * as Excel from 'exceljs';
import * as tmp from 'tmp';

@Injectable()
export class ReportDownloadService {
  private logger: Logger;

  constructor(private readonly reportsService: ReportsService) {
    this.logger = new Logger(ReportDownloadService.name);
  }

  async downloadReport(shopId: string, query: ReportQueryDto) {
    const customers = await this.reportsService.getCustomersForReport(shopId, query);

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    // write filters
    const filterRows: string[][] = [];
    const filters = Object.fromEntries(Object.entries(query).filter(([_, value]) => !!value));
    filterRows.push(Object.keys(filters));
    filterRows.push(Object.values(filters));

    sheet.addRows(filterRows);

    return await new Promise((resolve, reject) => {
      tmp.file({ discardDescriptor: true, prefix: 'Report', postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
        workbook.xlsx.writeFile(file).then((_) => resolve(file));
      });
    });
  }
}
