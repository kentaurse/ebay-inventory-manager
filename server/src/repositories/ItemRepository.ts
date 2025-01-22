import { EntityRepository, Repository } from 'typeorm';
import { Item } from '../models/Item';

@EntityRepository(Item)
export class ItemRepository extends Repository<Item> {
  async findItemsWithPriceHistory(userId: string, timeRange: { start: Date; end: Date }) {
    return this.createQueryBuilder('item')
      .leftJoinAndSelect('item.priceHistory', 'priceHistory', 
        'priceHistory.timestamp BETWEEN :start AND :end', 
        { start: timeRange.start, end: timeRange.end }
      )
      .where('item.userId = :userId', { userId })
      .orderBy('priceHistory.timestamp', 'DESC')
      .cache(true) // TypeORMのクエリキャッシュを有効化
      .getMany();
  }

  async findItemsNeedingPriceUpdate() {
    return this.createQueryBuilder('item')
      .where('item.lastPriceCheck < :threshold', {
        threshold: new Date(Date.now() - 3600000) // 1時間前
      })
      .orderBy('item.lastPriceCheck', 'ASC')
      .take(100)
      .getMany();
  }
} 