export interface Item {
  id: string;
  ebayItemId: string;
  title: string;
  currentPrice: number;
  minimumPrice: number;
  maximumPrice: number;
  quantity: number;
  lastUpdated: Date;
}

export interface PriceHistory {
  id: string;
  itemId: string;
  oldPrice: number;
  newPrice: number;
  marketAveragePrice: number;
  timestamp: Date;
}

export interface StockHistory {
  id: string;
  itemId: string;
  oldQuantity: number;
  newQuantity: number;
  changeReason: string;
  timestamp: Date;
} 