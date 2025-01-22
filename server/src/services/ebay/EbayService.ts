import { EbayAuthToken } from 'ebay-oauth-nodejs-client';
import { Finding, Shopping } from 'ebay-api';
import { Item } from '../../models/Item';
import { AppDataSource } from '../../config/database';
import { Logger } from '../../utils/logger';

export class EbayService {
  private authToken: EbayAuthToken;
  private finding: Finding;
  private shopping: Shopping;
  private itemRepository;

  constructor() {
    this.authToken = new EbayAuthToken({
      clientId: process.env.EBAY_APP_ID!,
      clientSecret: process.env.EBAY_CERT_ID!,
      env: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX'
    });

    this.itemRepository = AppDataSource.getRepository(Item);
  }

  async getCompetitorPrices(itemId: string) {
    try {
      const response = await this.finding.findItemsAdvanced({
        keywords: await this.getItemTitle(itemId),
        itemFilters: [
          { name: 'Condition', value: ['New', 'Like New'] },
          { name: 'FeedbackScoreMin', value: '95' }
        ],
        sortOrder: 'PricePlusShippingLowest'
      });

      return response.searchResult.item;
    } catch (error) {
      Logger.error('Error fetching competitor prices:', error);
      throw error;
    }
  }

  async updatePrice(item: Item) {
    try {
      const competitors = await this.getCompetitorPrices(item.ebayItemId);
      const newPrice = this.calculateOptimalPrice(competitors, item);

      if (newPrice >= item.minimumPrice && newPrice <= item.maximumPrice) {
        await this.shopping.reviseItem({
          ItemID: item.ebayItemId,
          StartPrice: newPrice
        });

        item.currentPrice = newPrice;
        await this.itemRepository.save(item);
      }
    } catch (error) {
      Logger.error('Error updating price:', error);
      throw error;
    }
  }

  private calculateOptimalPrice(competitors: any[], item: Item): number {
    // 競合他社の最安値を取得
    const lowestCompetitorPrice = Math.min(
      ...competitors.map(c => parseFloat(c.sellingStatus[0].currentPrice[0].__value__))
    );

    // 最安値より少し下の価格を設定（例：1%下）
    let optimalPrice = lowestCompetitorPrice * 0.99;

    // 最小価格と最大価格の範囲内に収める
    optimalPrice = Math.max(item.minimumPrice, Math.min(item.maximumPrice, optimalPrice));

    return Number(optimalPrice.toFixed(2));
  }
} 