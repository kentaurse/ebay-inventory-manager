import { Injectable } from '@nestjs/common';
import { Registry, Counter, Gauge, Histogram } from 'prom-client';
import { Logger } from '../../utils/logger';

@Injectable()
export class MetricsCollector {
  private readonly registry: Registry;
  
  // リクエストメトリクス
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly activeConnections: Gauge;
  
  // ビジネスメトリクス
  private readonly itemUpdatesTotal: Counter;
  private readonly priceChangesTotal: Counter;
  private readonly stockLevels: Gauge;
  
  // システムメトリクス
  private readonly memoryUsage: Gauge;
  private readonly cpuUsage: Gauge;

  constructor() {
    this.registry = new Registry();
    
    // HTTPメトリクスの初期化
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status']
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections'
    });

    // ビジネスメトリクスの初期化
    this.itemUpdatesTotal = new Counter({
      name: 'item_updates_total',
      help: 'Total number of item updates',
      labelNames: ['type']
    });

    this.priceChangesTotal = new Counter({
      name: 'price_changes_total',
      help: 'Total number of price changes',
      labelNames: ['direction']
    });

    this.stockLevels = new Gauge({
      name: 'stock_levels',
      help: 'Current stock levels',
      labelNames: ['item_id']
    });

    // システムメトリクスの初期化
    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes'
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage'
    });

    // メトリクスの登録
    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.activeConnections);
    this.registry.registerMetric(this.itemUpdatesTotal);
    this.registry.registerMetric(this.priceChangesTotal);
    this.registry.registerMetric(this.stockLevels);
    this.registry.registerMetric(this.memoryUsage);
    this.registry.registerMetric(this.cpuUsage);
  }

  // メトリクス収集メソッド
  recordHttpRequest(method: string, path: string, status: number, duration: number) {
    this.httpRequestsTotal.inc({ method, path, status });
    this.httpRequestDuration.observe({ method, path }, duration);
  }

  updateActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  recordItemUpdate(type: string) {
    this.itemUpdatesTotal.inc({ type });
  }

  recordPriceChange(direction: 'increase' | 'decrease') {
    this.priceChangesTotal.inc({ direction });
  }

  updateStockLevel(itemId: string, level: number) {
    this.stockLevels.set({ item_id: itemId }, level);
  }

  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.memoryUsage.set(memUsage.heapUsed);
    
    // CPU使用率の計算
    const cpuUsage = process.cpuUsage();
    const totalCPUUsage = (cpuUsage.user + cpuUsage.system) / 1000000;
    this.cpuUsage.set(totalCPUUsage);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
} 