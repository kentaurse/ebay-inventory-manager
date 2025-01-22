import { Between } from 'typeorm';
import { StockHistory, Item } from '../../entities';
import { StockHistoryRepository, ItemRepository, PriceHistoryRepository } from '../../repositories';

class AnalyticsService {
  constructor(
    private stockHistoryRepository: StockHistoryRepository,
    private itemRepository: ItemRepository,
    private priceHistoryRepository: PriceHistoryRepository
  ) {}

  private async getSalesData(userId: string, startDate: Date, endDate: Date) {
    const stockHistory = await this.stockHistoryRepository.find({
      where: {
        item: { userId },
        timestamp: Between(startDate, endDate),
        changeReason: 'SALE'
      },
      relations: ['item']
    });

    const dailyData = this.groupByDate(stockHistory, (record) => ({
      sales: record.oldQuantity - record.newQuantity,
      revenue: (record.oldQuantity - record.newQuantity) * record.item.currentPrice
    }));

    return {
      dates: Object.keys(dailyData),
      sales: Object.values(dailyData).map(d => d.sales),
      revenue: Object.values(dailyData).map(d => d.revenue)
    };
  }

  private async getInventoryData(userId: string) {
    const items = await this.itemRepository.find({
      where: { userId }
    });

    const statusCounts = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0
    };

    items.forEach(item => {
      if (item.quantity <= 0) {
        statusCounts.outOfStock++;
      } else if (item.quantity <= item.minimumQuantity) {
        statusCounts.lowStock++;
      } else {
        statusCounts.inStock++;
      }
    });

    return statusCounts;
  }

  private async getPriceData(userId: string, startDate: Date, endDate: Date) {
    const priceHistory = await this.priceHistoryRepository.find({
      where: {
        item: { userId },
        timestamp: Between(startDate, endDate)
      },
      relations: ['item'],
      order: { timestamp: 'ASC' }
    });

    const itemPrices: { [key: string]: any[] } = {};
    
    priceHistory.forEach(record => {
      if (!itemPrices[record.item.title]) {
        itemPrices[record.item.title] = [];
      }
      itemPrices[record.item.title].push({
        date: record.timestamp,
        price: record.newPrice,
        marketAverage: record.marketAveragePrice
      });
    });

    return Object.entries(itemPrices).map(([title, prices]) => ({
      title,
      prices: prices.map(p => p.price),
      marketAverages: prices.map(p => p.marketAverage),
      dates: prices.map(p => p.date)
    }));
  }

  private async calculateMetrics(userId: string, startDate: Date, endDate: Date) {
    const [sales, items] = await Promise.all([
      this.stockHistoryRepository.find({
        where: {
          item: { userId },
          timestamp: Between(startDate, endDate),
          changeReason: 'SALE'
        },
        relations: ['item']
      }),
      this.itemRepository.find({
        where: { userId }
      })
    ]);

    const totalSales = sales.reduce((sum, record) => 
      sum + (record.oldQuantity - record.newQuantity), 0);

    const totalRevenue = sales.reduce((sum, record) => 
      sum + ((record.oldQuantity - record.newQuantity) * record.item.currentPrice), 0);

    const averagePrice = items.reduce((sum, item) => 
      sum + item.currentPrice, 0) / items.length;

    const inventoryValue = items.reduce((sum, item) => 
      sum + (item.quantity * item.currentPrice), 0);

    const inventoryTurnover = totalRevenue / (inventoryValue || 1);

    const profitMargin = this.calculateProfitMargin(sales);

    return {
      totalSales,
      totalRevenue,
      averagePrice,
      inventoryTurnover,
      profitMargin
    };
  }

  private calculateProfitMargin(sales: StockHistory[]): number {
    // 簡易的な利益率計算（実際にはコスト情報も必要）
    const revenue = sales.reduce((sum, record) => 
      sum + ((record.oldQuantity - record.newQuantity) * record.item.currentPrice), 0);
    
    // 仮定：コストは売上の70%
    const estimatedCost = revenue * 0.7;
    return ((revenue - estimatedCost) / revenue) * 100;
  }

  private groupByDate(records: any[], valueExtractor: (record: any) => any) {
    const dailyData: { [key: string]: any } = {};

    records.forEach(record => {
      const date = record.timestamp.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { sales: 0, revenue: 0 };
      }

      const values = valueExtractor(record);
      dailyData[date].sales += values.sales;
      dailyData[date].revenue += values.revenue;
    });

    return dailyData;
  }
}

export default AnalyticsService; 