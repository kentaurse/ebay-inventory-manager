import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class NotificationPreference {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: true })
  lowStockAlerts: boolean;

  @Column({ default: true })
  priceChangeAlerts: boolean;

  @Column({ default: true })
  errorAlerts: boolean;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @Column({ default: 5 })
  priceChangeThresholdPercent: number;

  @Column({ nullable: true })
  webhookUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 