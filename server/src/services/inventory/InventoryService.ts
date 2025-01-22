import { Injectable } from '@nestjs/common';
import { EbayService } from '../ebay/EbayService';
import { AppDataSource } from '../../config/database';
import { Item } from '../../models/Item';
import { Logger } from '../../utils/logger';

@Injectable()
export class InventoryService {
  private readonly itemRepository;

  constructor(private readonly ebayService: EbayService) {
    this.itemRepository = AppDataSource.getRepository(Item);
  }

  async checkInventory(itemId: string) {
    try {
      const item = await this.itemRepository.findOne({ where: { ebayItemId: itemId } });
      if (!item) {
        throw new Error('Item not found');
      }

      const ebayItem = await this.ebayService.getItem(itemId);
      const currentQuantity = parseInt(ebayItem.Quantity);

      // 在庫が少なくなった場合の通知
      if (currentQuantity < item.minimumQuantity) {
        await this.notifyLowStock(item, currentQuantity);
      }

      // 在庫数を更新
      item.quantity = currentQuantity;
      await this.itemRepository.save(item);

      return { success: true, quantity: currentQuantity };
    } catch (error) {
      Logger.error('Error checking inventory:', error);
      throw error;
    }
  }

  private async notifyLowStock(item: Item, currentQuantity: number) {
    // 在庫低下通知の実装
    Logger.warn(`Low stock alert: Item ${item.ebayItemId} has only ${currentQuantity} units remaining`);
    // ここに通知ロジックを実装（メール送信など）
  }
} 