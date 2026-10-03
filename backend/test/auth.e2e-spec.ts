import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup-test-app';

describe('Authentication & Authorization (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let managerToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Admin login succeeds with role ADMIN and valid JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@assetflow.com',
        password: 'admin123',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('role', 'ADMIN');
    expect(res.body.user.email).toBe('admin@assetflow.com');
    adminToken = res.body.accessToken;
  });

  it('2. Manager login succeeds with role MANAGER and valid JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'manager@assetflow.com',
        password: 'manager123',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('role', 'MANAGER');
    expect(res.body.user.email).toBe('manager@assetflow.com');
    managerToken = res.body.accessToken;
  });

  it('3. Employee login succeeds with role EMPLOYEE, valid JWT, and linked employeeId', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'employee@assetflow.com',
        password: 'employee123',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('role', 'EMPLOYEE');
    expect(res.body.user.email).toBe('employee@assetflow.com');
    expect(res.body.user.employeeId).toBeTruthy();
    employeeToken = res.body.accessToken;
  });

  it('4. Wrong password fails with 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@assetflow.com',
        password: 'wrongPassword!@#',
      })
      .expect(401);

    const message = res.body.detail || res.body.message;
    expect(message).toContain('Invalid email or password');
  });

  it('5. Unknown email fails with 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'unknown-user@company.com',
        password: 'anyPassword123',
      })
      .expect(401);

    const message = res.body.detail || res.body.message;
    expect(message).toContain('Invalid email or password');
  });

  it('6. Protected profile route works for Admin, Manager, and Employee', async () => {
    // Admin profile check
    const adminRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminRes.body).toHaveProperty('email', 'admin@assetflow.com');
    expect(adminRes.body).toHaveProperty('role', 'ADMIN');

    // Manager profile check
    const managerRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(managerRes.body).toHaveProperty('email', 'manager@assetflow.com');
    expect(managerRes.body).toHaveProperty('role', 'MANAGER');

    // Employee profile check
    const empRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);

    expect(empRes.body).toHaveProperty('email', 'employee@assetflow.com');
    expect(empRes.body).toHaveProperty('role', 'EMPLOYEE');

    // Without token should fail with 401
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });
});
