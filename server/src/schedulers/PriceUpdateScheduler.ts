import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EbayService } from '../services/ebay/EbayService';
import { AppDataSource } from '../config/database';
import { Item } from '../models/Item';
import { Logger } from '../utils/logger';

@Injectable()
export class PriceUpdateScheduler {
  private readonly itemRepository;

  constructor(private readonly ebayService: EbayService) {
    this.itemRepository = AppDataSource.getRepository(Item);
  }

  // 1時間ごとに実行
  @Cron('0 * * * *')
  async handlePriceUpdates() {
    try {
      Logger.info('Starting price update cycle');
      
      const items = await this.itemRepository.find();
      
      for (const item of items) {
        try {
          await this.ebayService.updatePrice(item);
          Logger.info(`Successfully updated price for item ${item.ebayItemId}`);
        } catch (error) {
          Logger.error(`Failed to update price for item ${item.ebayItemId}:`, error);
        }
      }
    } catch (error) {
      Logger.error('Error in price update cycle:', error);
    }
  }
} 