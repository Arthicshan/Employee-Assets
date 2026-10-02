import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup-test-app';

describe('Assignments (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/assignments (GET) - lists assignments', async () => {
    const res = await request(app.getHttpServer())
      .get('/assignments')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('/assignments (POST) - rejects invalid payload with RFC 7807 problem details', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        assetId: 99999,
        employeeId: 99999,
      })
      .expect(404);

    expect(res.body).toHaveProperty('status', 404);
  });
});

