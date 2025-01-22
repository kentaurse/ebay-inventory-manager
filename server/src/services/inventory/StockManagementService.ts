import { Injectable } from '@nestjs/common';
import { EbayService } from '../ebay/EbayService';
import { AppDataSource } from '../../config/database';
import { Item } from '../../models/Item';
import { StockHistory } from '../../models/StockHistory';
import { NotificationService } from '../notification/NotificationService';
import { Logger } from '../../utils/logger';

@Injectable()
export class StockManagementService {
  private readonly itemRepository;
  private readonly stockHistoryRepository;

  constructor(
    private readonly ebayService: EbayService,
    private readonly notificationService: NotificationService
  ) {
    this.itemRepository = AppDataSource.getRepository(Item);
    this.stockHistoryRepository = AppDataSource.getRepository(StockHistory);
  }

  async updateStockLevels(userId: string) {
    try {
      const items = await this.itemRepository.find({ where: { userId } });
      
      for (const item of items) {
        await this.checkAndUpdateStock(item);
      }
    } catch (error) {
      Logger.error('Stock update failed:', error);
      throw error;
    }
  }

  private async checkAndUpdateStock(item: Item) {
    try {
      const ebayItem = await this.ebayService.getItem(item.ebayItemId);
      const currentQuantity = parseInt(ebayItem.Quantity);
      const oldQuantity = item.quantity;

      // 在庫履歴を記録
      await this.saveStockHistory(item, oldQuantity, currentQuantity);

      // 在庫が閾値を下回った場合に通知
      if (currentQuantity <= item.minimumQuantity) {
        await this.notificationService.sendLowStockAlert({
          itemId: item.ebayItemId,
          title: item.title,
          currentStock: currentQuantity,
          minimumStock: item.minimumQuantity
        });
      }

      // 在庫数を更新
      item.quantity = currentQuantity;
      await this.itemRepository.save(item);

      return { success: true, quantity: currentQuantity };
    } catch (error) {
      Logger.error(`Stock check failed for item ${item.ebayItemId}:`, error);
      throw error;
    }
  }

  private async saveStockHistory(item: Item, oldQuantity: number, newQuantity: number) {
    const history = new StockHistory();
    history.item = item;
    history.oldQuantity = oldQuantity;
    history.newQuantity = newQuantity;
    history.changeReason = this.determineStockChangeReason(oldQuantity, newQuantity);

    await this.stockHistoryRepository.save(history);
  }

  private determineStockChangeReason(oldQuantity: number, newQuantity: number): string {
    if (newQuantity < oldQuantity) {
      return 'SALE';
    } else if (newQuantity > oldQuantity) {
      return 'RESTOCK';
    }
    return 'NO_CHANGE';
  }
} 