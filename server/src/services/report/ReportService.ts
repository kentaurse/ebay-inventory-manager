import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../config/database';
import { Item } from '../../models/Item';
import { PriceHistory } from '../../models/PriceHistory';
import { StockHistory } from '../../models/StockHistory';
import { ExcelJS } from 'exceljs';
import { Logger } from '../../utils/logger';

interface ReportTimeRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ReportService {
  private readonly itemRepository;
  private readonly priceHistoryRepository;
  private readonly stockHistoryRepository;

  constructor() {
    this.itemRepository = AppDataSource.getRepository(Item);
    this.priceHistoryRepository = AppDataSource.getRepository(PriceHistory);
    this.stockHistoryRepository = AppDataSource.getRepository(StockHistory);
  }

  async generateSalesReport(userId: string, timeRange: ReportTimeRange) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      // 基本情報の取得
      const items = await this.itemRepository.find({
        where: { userId },
        relations: ['priceHistory', 'stockHistory']
      });

      // レポートヘッダーの設定
      worksheet.columns = [
        { header: 'Item ID', key: 'itemId', width: 20 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Current Price', key: 'currentPrice', width: 15 },
        { header: 'Current Stock', key: 'quantity', width: 15 },
        { header: 'Sales Count', key: 'salesCount', width: 15 },
        { header: 'Revenue', key: 'revenue', width: 15 },
        { header: 'Avg Price', key: 'avgPrice', width: 15 }
      ];

      // データの集計と追加
      for (const item of items) {
        const salesData = await this.calculateSalesData(item, timeRange);
        worksheet.addRow({
          itemId: item.ebayItemId,
          title: item.title,
          currentPrice: item.currentPrice,
          quantity: item.quantity,
          ...salesData
        });
      }

      // スタイリングの適用
      this.applyWorksheetStyling(worksheet);

      return workbook;
    } catch (error) {
      Logger.error('Failed to generate sales report:', error);
      throw error;
    }
  }

  async generateInventoryReport(userId: string) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory Report');

      worksheet.columns = [
        { header: 'Item ID', key: 'itemId', width: 20 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Current Stock', key: 'quantity', width: 15 },
        { header: 'Min Price', key: 'minPrice', width: 15 },
        { header: 'Max Price', key: 'maxPrice', width: 15 },
        { header: 'Current Price', key: 'currentPrice', width: 15 },
        { header: 'Stock Status', key: 'stockStatus', width: 15 }
      ];

      const items = await this.itemRepository.find({ where: { userId } });

      for (const item of items) {
        worksheet.addRow({
          itemId: item.ebayItemId,
          title: item.title,
          quantity: item.quantity,
          minPrice: item.minimumPrice,
          maxPrice: item.maximumPrice,
          currentPrice: item.currentPrice,
          stockStatus: this.getStockStatus(item)
        });
      }

      this.applyWorksheetStyling(worksheet);

      return workbook;
    } catch (error) {
      Logger.error('Failed to generate inventory report:', error);
      throw error;
    }
  }

  async generatePriceAnalysisReport(userId: string, timeRange: ReportTimeRange) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Price Analysis');

      worksheet.columns = [
        { header: 'Item ID', key: 'itemId', width: 20 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Price Changes', key: 'priceChanges', width: 15 },
        { header: 'Avg Market Price', key: 'avgMarketPrice', width: 15 },
        { header: 'Min Price', key: 'minPrice', width: 15 },
        { header: 'Max Price', key: 'maxPrice', width: 15 },
        { header: 'Price Trend', key: 'priceTrend', width: 15 }
      ];

      const items = await this.itemRepository.find({
        where: { userId },
        relations: ['priceHistory']
      });

      for (const item of items) {
        const analysis = await this.analyzePriceHistory(item, timeRange);
        worksheet.addRow({
          itemId: item.ebayItemId,
          title: item.title,
          ...analysis
        });
      }

      this.applyWorksheetStyling(worksheet);

      return workbook;
    } catch (error) {
      Logger.error('Failed to generate price analysis report:', error);
      throw error;
    }
  }

  private async calculateSalesData(item: Item, timeRange: ReportTimeRange) {
    const stockHistory = item.stockHistory.filter(
      h => h.timestamp >= timeRange.startDate && h.timestamp <= timeRange.endDate
    );

    const salesCount = stockHistory.reduce((total, record) => {
      return total + (record.changeReason === 'SALE' ? 
        (record.oldQuantity - record.newQuantity) : 0);
    }, 0);

    const priceHistory = item.priceHistory.filter(
      h => h.timestamp >= timeRange.startDate && h.timestamp <= timeRange.endDate
    );

    const avgPrice = priceHistory.reduce((sum, record) => 
      sum + record.newPrice, 0) / priceHistory.length;

    return {
      salesCount,
      revenue: salesCount * avgPrice,
      avgPrice
    };
  }

  private getStockStatus(item: Item): string {
    if (item.quantity <= 0) return 'OUT_OF_STOCK';
    if (item.quantity <= item.minimumQuantity) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  private async analyzePriceHistory(item: Item, timeRange: ReportTimeRange) {
    const priceHistory = item.priceHistory.filter(
      h => h.timestamp >= timeRange.startDate && h.timestamp <= timeRange.endDate
    );

    const priceChanges = priceHistory.length;
    const avgMarketPrice = priceHistory.reduce((sum, record) => 
      sum + record.marketAveragePrice, 0) / priceHistory.length;

    const prices = priceHistory.map(h => h.newPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // 価格トレンドの計算
    const priceTrend = this.calculatePriceTrend(priceHistory);

    return {
      priceChanges,
      avgMarketPrice,
      minPrice,
      maxPrice,
      priceTrend
    };
  }

  private calculatePriceTrend(priceHistory: PriceHistory[]): string {
    if (priceHistory.length < 2) return 'STABLE';

    const firstPrice = priceHistory[0].newPrice;
    const lastPrice = priceHistory[priceHistory.length - 1].newPrice;
    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (percentChange > 5) return 'INCREASING';
    if (percentChange < -5) return 'DECREASING';
    return 'STABLE';
  }

  private applyWorksheetStyling(worksheet: ExcelJS.Worksheet) {
    // ヘッダーのスタイリング
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // 罫線の追加
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  }
} 