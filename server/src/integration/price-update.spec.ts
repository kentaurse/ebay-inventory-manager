import { Test, TestingModule } from '@nestjs/testing';
import { EbayService } from '../services/ebay/EbayService';
import { PriceMonitorService } from '../services/price/PriceMonitorService';
import { NotificationService } from '../services/notification/NotificationService';
import { AppDataSource } from '../config/database';
import { Item } from '../models/Item';

describe('Price Update Integration', () => {
  let ebayService: EbayService;
  let priceMonitorService: PriceMonitorService;
  let notificationService: NotificationService;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EbayService,
        PriceMonitorService,
        NotificationService,
      ],
    }).compile();

    ebayService = module.get<EbayService>(EbayService);
    priceMonitorService = module.get<PriceMonitorService>(PriceMonitorService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should update price and send notification when price changes significantly', async () => {
    // テストデータのセットアップ
    const item = new Item();
    item.ebayItemId = 'test-item-1';
    item.currentPrice = 100;
    item.minimumPrice = 80;
    item.maximumPrice = 120;

    // 通知送信のモック
    const notifySpy = jest.spyOn(notificationService, 'sendPriceChangeAlert');

    // 価格更新の実行
    await priceMonitorService.monitorPrice(item);

    // アサーション
    expect(notifySpy).toHaveBeenCalled();
    expect(item.currentPrice).not.toBe(100);
  });
}); 