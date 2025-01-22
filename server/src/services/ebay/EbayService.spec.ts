import { Test, TestingModule } from '@nestjs/testing';
import { EbayService } from './EbayService';
import { Item } from '../../models/Item';
import { AppDataSource } from '../../config/database';

describe('EbayService', () => {
  let service: EbayService;
  let mockItemRepository: any;

  beforeEach(async () => {
    mockItemRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EbayService,
        {
          provide: 'ItemRepository',
          useValue: mockItemRepository
        }
      ],
    }).compile();

    service = module.get<EbayService>(EbayService);
  });

  describe('updatePrice', () => {
    it('should update item price within min/max range', async () => {
      const mockItem = new Item();
      mockItem.id = '1';
      mockItem.minimumPrice = 10;
      mockItem.maximumPrice = 20;
      mockItem.currentPrice = 15;

      const mockCompetitorPrices = [
        { sellingStatus: [{ currentPrice: [{ __value__: '12.00' }] }] }
      ];

      jest.spyOn(service as any, 'getCompetitorPrices')
        .mockResolvedValue(mockCompetitorPrices);

      await service.updatePrice(mockItem);

      expect(mockItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          currentPrice: expect.any(Number)
        })
      );
    });

    it('should not update price if below minimum', async () => {
      const mockItem = new Item();
      mockItem.minimumPrice = 10;
      mockItem.maximumPrice = 20;
      mockItem.currentPrice = 15;

      const mockCompetitorPrices = [
        { sellingStatus: [{ currentPrice: [{ __value__: '5.00' }] }] }
      ];

      jest.spyOn(service as any, 'getCompetitorPrices')
        .mockResolvedValue(mockCompetitorPrices);

      await service.updatePrice(mockItem);

      expect(mockItem.currentPrice).toBe(15);
    });
  });
}); 