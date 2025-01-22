import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class BatchHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  type: 'PRICE_UPDATE' | 'STOCK_CHECK' | 'DAILY_STATS';

  @Column()
  status: 'SUCCESS' | 'FAILED';

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'json', nullable: true })
  results: any;

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;
} 