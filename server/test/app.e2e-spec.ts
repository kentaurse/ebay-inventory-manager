import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/guards/auth.guard';
import { User } from '../src/models/User';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // テストユーザーの作成とログイン
    const user = new User();
    user.email = 'test@example.com';
    await user.setPassword('password123');
    // ユーザーの保存とトークンの取得
    authToken = 'test-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/items (GET)', () => {
    it('should return list of items', () => {
      return request(app.getHttpServer())
        .get('/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
  });

  describe('/analytics/dashboard (GET)', () => {
    it('should return dashboard data', () => {
      return request(app.getHttpServer())
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ timeRange: '7d' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('salesData');
          expect(res.body).toHaveProperty('inventoryData');
          expect(res.body).toHaveProperty('metrics');
        });
    });
  });
}); 