import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EbayService } from '../ebay/EbayService';
import { PriceMonitorService } from '../price/PriceMonitorService';
import { StockManagementService } from '../inventory/StockManagementService';
import { NotificationService } from '../notification/NotificationService';
import { AppDataSource } from '../../config/database';
import { Item } from '../../models/Item';
import { Logger } from '../../utils/logger';
import { BatchHistory } from '../../models/BatchHistory';

@Injectable()
export class BatchSchedulerService {
  private readonly itemRepository;
  private readonly batchHistoryRepository;

  constructor(
    private readonly ebayService: EbayService,
    private readonly priceMonitorService: PriceMonitorService,
    private readonly stockManagementService: StockManagementService,
    private readonly notificationService: NotificationService
  ) {
    this.itemRepository = AppDataSource.getRepository(Item);
    this.batchHistoryRepository = AppDataSource.getRepository(BatchHistory);
  }

  // 1時間ごとの価格更新
  @Cron(CronExpression.EVERY_HOUR)
  async handlePriceUpdates() {
    const batchHistory = new BatchHistory();
    batchHistory.type = 'PRICE_UPDATE';
    batchHistory.startTime = new Date();

    try {
      Logger.info('Starting hourly price update batch');
      const items = await this.itemRepository.find();
      
      const results = {
        success: 0,
        failed: 0,
        skipped: 0
      };

      for (const item of items) {
        try {
          const shouldUpdate = await this.priceMonitorService.shouldUpdatePrice(item);
          
          if (shouldUpdate) {
            await this.priceMonitorService.updatePrice(item);
            results.success++;
          } else {
            results.skipped++;
          }
        } catch (error) {
          results.failed++;
          Logger.error(`Failed to update price for item ${item.id}:`, error);
        }
      }

      batchHistory.status = 'SUCCESS';
      batchHistory.results = results;
    } catch (error) {
      batchHistory.status = 'FAILED';
      batchHistory.error = error.message;
      Logger.error('Price update batch failed:', error);
    } finally {
      batchHistory.endTime = new Date();
      await this.batchHistoryRepository.save(batchHistory);
    }
  }

  // 15分ごとの在庫チェック
  @Cron('*/15 * * * *')
  async handleStockCheck() {
    const batchHistory = new BatchHistory();
    batchHistory.type = 'STOCK_CHECK';
    batchHistory.startTime = new Date();

    try {
      Logger.info('Starting stock check batch');
      const items = await this.itemRepository.find();
      
      const results = {
        success: 0,
        failed: 0,
        lowStock: 0
      };

      for (const item of items) {
        try {
          const stockStatus = await this.stockManagementService.checkStock(item);
          
          if (stockStatus.isLow) {
            results.lowStock++;
            await this.notificationService.sendLowStockAlert({
              itemId: item.ebayItemId,
              title: item.title,
              currentStock: stockStatus.quantity,
              minimumStock: item.minimumQuantity
            });
          }
          
          results.success++;
        } catch (error) {
          results.failed++;
          Logger.error(`Failed to check stock for item ${item.id}:`, error);
        }
      }

      batchHistory.status = 'SUCCESS';
      batchHistory.results = results;
    } catch (error) {
      batchHistory.status = 'FAILED';
      batchHistory.error = error.message;
      Logger.error('Stock check batch failed:', error);
    } finally {
      batchHistory.endTime = new Date();
      await this.batchHistoryRepository.save(batchHistory);
    }
  }

  // 毎日の統計データ集計
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyStats() {
    const batchHistory = new BatchHistory();
    batchHistory.type = 'DAILY_STATS';
    batchHistory.startTime = new Date();

    try {
      Logger.info('Starting daily stats calculation');
      // 日次統計の計算と保存
      await this.calculateAndStoreDailyStats();
      batchHistory.status = 'SUCCESS';
    } catch (error) {
      batchHistory.status = 'FAILED';
      batchHistory.error = error.message;
      Logger.error('Daily stats calculation failed:', error);
    } finally {
      batchHistory.endTime = new Date();
      await this.batchHistoryRepository.save(batchHistory);
    }
  }

  private async calculateAndStoreDailyStats() {
    // 日次統計の計算ロジックを実装
  }
} 