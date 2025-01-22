import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory/InventoryService';
import { Logger } from '../utils/logger';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  async checkInventory(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const result = await this.inventoryService.checkInventory(itemId);
      res.json(result);
    } catch (error) {
      Logger.error('Error in inventory check:', error);
      res.status(500).json({ error: 'Failed to check inventory' });
    }
  }
} 