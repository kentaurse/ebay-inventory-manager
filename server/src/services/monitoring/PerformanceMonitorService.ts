import { Injectable } from '@nestjs/common';
import { Logger } from '../../utils/logger';

interface PerformanceMetrics {
  responseTime: number;
  timestamp: Date;
  endpoint: string;
  success: boolean;
}

@Injectable()
export class PerformanceMonitorService {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000;

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // 遅いレスポンスの警告
    if (metric.responseTime > 1000) { // 1秒以上
      Logger.warn(`Slow response detected: ${metric.endpoint} took ${metric.responseTime}ms`);
    }
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, curr) => acc + curr.responseTime, 0);
    return sum / relevantMetrics.length;
  }

  getSuccessRate(endpoint?: string): number {
    const relevantMetrics = endpoint
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const successCount = relevantMetrics.filter(m => m.success).length;
    return (successCount / relevantMetrics.length) * 100;
  }
} 