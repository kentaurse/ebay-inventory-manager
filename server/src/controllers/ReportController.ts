import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from '../services/report/ReportService';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales')
  async generateSalesReport(
    @CurrentUser() userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const timeRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    const workbook = await this.reportService.generateSalesReport(userId, timeRange);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=sales-report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('inventory')
  async generateInventoryReport(
    @CurrentUser() userId: string,
    @Res() res: Response
  ) {
    const workbook = await this.reportService.generateInventoryReport(userId);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=inventory-report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('price-analysis')
  async generatePriceAnalysisReport(
    @CurrentUser() userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const timeRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    const workbook = await this.reportService.generatePriceAnalysisReport(
      userId,
      timeRange
    );
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=price-analysis.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  }
} 