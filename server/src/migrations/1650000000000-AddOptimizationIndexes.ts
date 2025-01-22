import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOptimizationIndexes1650000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Items テーブルのインデックス
    await queryRunner.query(`
      CREATE INDEX idx_items_user_id ON items(user_id);
      CREATE INDEX idx_items_ebay_item_id ON items(ebay_item_id);
      CREATE INDEX idx_items_price_range ON items(current_price, minimum_price, maximum_price);
    `);

    // PriceHistory テーブルのインデックス
    await queryRunner.query(`
      CREATE INDEX idx_price_history_item_date ON price_history(item_id, timestamp);
      CREATE INDEX idx_price_history_price_changes ON price_history(old_price, new_price);
    `);

    // StockHistory テーブルのインデックス
    await queryRunner.query(`
      CREATE INDEX idx_stock_history_item_date ON stock_history(item_id, timestamp);
      CREATE INDEX idx_stock_history_quantity_changes ON stock_history(old_quantity, new_quantity);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_items_user_id;
      DROP INDEX idx_items_ebay_item_id;
      DROP INDEX idx_items_price_range;
      DROP INDEX idx_price_history_item_date;
      DROP INDEX idx_price_history_price_changes;
      DROP INDEX idx_stock_history_item_date;
      DROP INDEX idx_stock_history_quantity_changes;
    `);
  }
} 