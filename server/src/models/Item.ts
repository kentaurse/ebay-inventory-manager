import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Item {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  ebayItemId: string;

  @Column()
  title: string;

  @Column("decimal")
  currentPrice: number;

  @Column("decimal")
  minimumPrice: number;

  @Column("decimal")
  maximumPrice: number;

  @Column()
  quantity: number;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 