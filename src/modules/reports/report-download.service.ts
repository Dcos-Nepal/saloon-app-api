import { Injectable, Logger } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/reports.dto';
import { Workbook, Worksheet } from 'exceljs';
import * as tmp from 'tmp';
import { capitalize } from '../../common/utils/string-utils';
import { DateTime } from 'luxon';

@Injectable()
export class ReportDownloadService {
  private logger: Logger;

  constructor(private readonly reportsService: ReportsService) {
    this.logger = new Logger(ReportDownloadService.name);
  }

  async downloadReport(shopId: string, query: ReportQueryDto) {
    const customers = await this.reportsService.getCustomersForReport(shopId, query);

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    // write filters
    sheet.mergeCells('A1', 'B1');
    sheet.getCell('A1').value = 'Filters';
    const filterRows: string[][] = [];
    const filters = Object.fromEntries(Object.entries(query).filter(([_, value]) => !!value));
    filterRows.push(Object.keys(filters).map((value) => capitalize(value)));
    filterRows.push(Object.values(filters));
    sheet.addRows(filterRows);

    // write customers rows
    const headers = ['Sn', 'Name', 'Address', 'Phone', 'Email', 'Services', 'Session', 'Last Appointment', 'Type', 'Status'];
    sheet.getRow(6).values = headers;

    sheet.columns = [
      { key: 'sn', width: 10 },
      { key: 'name', width: 25 },
      { key: 'address', width: 25 },
      { key: 'phone', width: 20 },
      { key: 'email', width: 20 },
      { key: 'services', width: 30 },
      { key: 'session', width: 10 },
      { key: 'appointmentDate', width: 30, style: { numFmt: 'yyyy/mm/dd hh:mm AM/PM' } },
      { key: 'type', width: 20 },
      { key: 'status', width: 20 }
    ];

    customers.forEach((item, index) => {
      const customer = item.customer;
      const appointmentDate = `${item.appointmentDate} ${DateTime.fromISO(item.appointmentTime).toFormat('hh:mm a')}`;

      sheet.addRow({
        sn: index + 1,
        name: customer.fullName,
        address: customer.address,
        phone: customer.phoneNumber,
        email: customer.email,
        services: item?.services?.join(',\n'),
        session: item.session,
        appointmentDate: appointmentDate,
        type: item?.type,
        status: item?.status?.name
      });
    });

    this.styleSheet(sheet);

    return await new Promise((resolve, reject) => {
      tmp.file({ discardDescriptor: true, prefix: 'Report', postfix: '.xlsx', mode: parseInt('0600', 8) }, async (err, file) => {
        workbook.xlsx.writeFile(file).then((_) => resolve(file));
      });
    });
  }

  private styleSheet(sheet: Worksheet) {
    sheet.columns.forEach((column) => {
      column.font = {
        size: 12
      };
    });

    const bold = { bold: true };
    const boldLarge = { size: 14, bold: true };
    // filters
    sheet.getRow(1).font = boldLarge;
    sheet.getRow(2).font = bold;

    // data rows
    sheet.getRow(6).font = bold;
  }
}
