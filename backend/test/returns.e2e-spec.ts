import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup-test-app';

describe('Returns (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/returns (POST) - rejects return for non-existent assignment with 404', async () => {
    const res = await request(app.getHttpServer())
      .post('/returns')
      .send({
        assignmentId: 99999,
        condition: 'GOOD',
      })
      .expect(404);

    expect(res.body).toHaveProperty('status', 404);
  });
});

