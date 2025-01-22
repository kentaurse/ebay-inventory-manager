import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PerformanceMonitorService } from '../services/monitoring/PerformanceMonitorService';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  constructor(private performanceMonitor: PerformanceMonitorService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      this.performanceMonitor.recordMetric({
        responseTime,
        timestamp: new Date(),
        endpoint: req.path,
        success: res.statusCode < 400
      });
    });

    next();
  }
} 