import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // IPごとのリクエスト制限
    message: 'Too many requests from this IP, please try again later.'
  });

  private readonly corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400 // 24時間
  };

  use(req: Request, res: Response, next: NextFunction) {
    // セキュリティヘッダーの設定
    helmet()(req, res, () => {});
    
    // CORS設定
    cors(this.corsOptions)(req, res, () => {});
    
    // レート制限
    this.rateLimiter(req, res, () => {});
    
    next();
  }
} 