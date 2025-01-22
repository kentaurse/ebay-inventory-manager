import { Item } from '../../models/Item';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';

export class TestHelper {
  static async createTestUser(): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);
    const user = new User();
    user.email = `test-${Date.now()}@example.com`;
    user.name = 'Test User';
    await user.setPassword('password123');
    return await userRepository.save(user);
  }

  static async createTestItem(user: User): Promise<Item> {
    const itemRepository = AppDataSource.getRepository(Item);
    const item = new Item();
    item.ebayItemId = `test-item-${Date.now()}`;
    item.title = 'Test Item';
    item.currentPrice = 100;
    item.minimumPrice = 80;
    item.maximumPrice = 120;
    item.quantity = 10;
    item.userId = user.id;
    return await itemRepository.save(item);
  }

  static async cleanupTestData(): Promise<void> {
    await AppDataSource.getRepository(Item).delete({});
    await AppDataSource.getRepository(User).delete({});
  }
} 