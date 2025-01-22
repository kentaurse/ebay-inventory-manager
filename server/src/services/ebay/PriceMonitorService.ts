import { Injectable } from '@nestjs/common';
import { EbayService } from './EbayService';
import { AppDataSource } from '../../config/database';
import { Item } from '../../models/Item';
import { PriceHistory } from '../../models/PriceHistory';
import { Logger } from '../../utils/logger';

@Injectable()
export class PriceMonitorService {
  private readonly itemRepository;
  private readonly priceHistoryRepository;

  constructor(private readonly ebayService: EbayService) {
    this.itemRepository = AppDataSource.getRepository(Item);
    this.priceHistoryRepository = AppDataSource.getRepository(PriceHistory);
  }

  async monitorPrice(itemId: string) {
    try {
      const item = await this.itemRepository.findOneOrFail({ where: { ebayItemId: itemId } });
      const competitors = await this.ebayService.getCompetitorPrices(itemId);
      
      const analysis = this.analyzePrices(competitors, item);
      
      if (analysis.shouldUpdate) {
        await this.ebayService.updatePrice(item);
        
        // 価格履歴を保存
        await this.savePriceHistory(item, analysis);
      }

      return analysis;
    } catch (error) {
      Logger.error(`Price monitoring failed for item ${itemId}:`, error);
      throw error;
    }
  }

  private analyzePrices(competitors: any[], item: Item) {
    const competitorPrices = competitors.map(c => ({
      price: parseFloat(c.sellingStatus[0].currentPrice[0].__value__),
      feedback: parseInt(c.sellerInfo[0].feedbackScore[0]),
      location: c.location[0],
      condition: c.condition[0].conditionId[0]
    }));

    // 競合他社の価格を分析
    const relevantCompetitors = competitorPrices.filter(c => 
      c.feedback >= 95 && // フィードバック率95%以上
      ['1000', '1500', '2000'].includes(c.condition) // New, Like New, Very Good
    );

    const averagePrice = relevantCompetitors.reduce((sum, c) => sum + c.price, 0) / relevantCompetitors.length;
    const lowestPrice = Math.min(...relevantCompetitors.map(c => c.price));

    return {
      shouldUpdate: item.currentPrice > lowestPrice * 1.01, // 競合より1%以上高い場合に更新
      suggestedPrice: Math.max(
        item.minimumPrice,
        Math.min(lowestPrice * 0.99, item.maximumPrice)
      ),
      marketAnalysis: {
        averagePrice,
        lowestPrice,
        competitorCount: relevantCompetitors.length
      }
    };
  }

  private async savePriceHistory(item: Item, analysis: any) {
    const history = new PriceHistory();
    history.item = item;
    history.oldPrice = item.currentPrice;
    history.newPrice = analysis.suggestedPrice;
    history.marketAveragePrice = analysis.marketAnalysis.averagePrice;
    history.competitorCount = analysis.marketAnalysis.competitorCount;

    await this.priceHistoryRepository.save(history);
  }
} 