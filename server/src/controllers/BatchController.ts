import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AppDataSource } from '../config/database';
import { BatchHistory } from '../models/BatchHistory';

@Controller('batch')
@UseGuards(AuthGuard)
export class BatchController {
  private readonly batchHistoryRepository;

  constructor() {
    this.batchHistoryRepository = AppDataSource.getRepository(BatchHistory);
  }

  @Get('history')
  async getBatchHistory(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('limit') limit = 10
  ) {
    const query = this.batchHistoryRepository.createQueryBuilder('batch')
      .orderBy('batch.startTime', 'DESC')
      .take(limit);

    if (type) {
      query.andWhere('batch.type = :type', { type });
    }

    if (status) {
      query.andWhere('batch.status = :status', { status });
    }

    return await query.getMany();
  }

  @Get('stats')
  async getBatchStats() {
    const stats = await this.batchHistoryRepository
      .createQueryBuilder('batch')
      .select('batch.type', 'type')
      .addSelect('batch.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('batch.type')
      .addGroupBy('batch.status')
      .getRawMany();

    return stats;
  }
} 