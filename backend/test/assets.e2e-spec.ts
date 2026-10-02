import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup-test-app';

describe('Assets (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/assets (GET) - lists assets with pagination metadata', async () => {
    const res = await request(app.getHttpServer())
      .get('/assets?page=1&limit=10')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/assets (GET) - filters assets by status', async () => {
    const res = await request(app.getHttpServer())
      .get('/assets?status=available')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    if (res.body.data.length > 0) {
      expect(res.body.data[0].status.toLowerCase()).toBe('available');
    }
  });
});

