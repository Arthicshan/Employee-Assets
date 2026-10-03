import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './setup-test-app';

describe('Returns (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/returns (POST) - rejects return for non-existent assignment with 404', async () => {
    const res = await request(app.getHttpServer())
      .post('/returns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assignmentId: 99999,
        condition: 'GOOD',
      })
      .expect(404);

    expect(res.body).toHaveProperty('status', 404);
  });
});


