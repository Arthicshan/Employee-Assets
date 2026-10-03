import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './setup-test-app';

describe('Assets (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/assets (GET) - lists assets', async () => {
    const res = await request(app.getHttpServer())
      .get('/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/assets (GET) - filters assets by status', async () => {
    const res = await request(app.getHttpServer())
      .get('/assets?status=available')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const assets = Array.isArray(res.body) ? res.body : res.body.data;
    expect(Array.isArray(assets)).toBe(true);
    if (assets.length > 0) {
      expect(assets[0].status.toLowerCase()).toBe('available');
    }
  });

});


