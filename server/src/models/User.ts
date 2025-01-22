import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { hashPassword } from "../utils/auth";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  ebayAuthToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async setPassword(password: string) {
    this.passwordHash = await hashPassword(password);
  }
} 