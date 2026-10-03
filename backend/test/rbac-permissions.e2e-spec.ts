import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RBAC & Role Permissions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let managerToken: string;
  let employeeToken: string;

  const testSuffix = Date.now().toString().slice(-6);
  let createdAssetId: number;
  let createdEmployeeId: number;
  let createdAssignmentId: number;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);

    // 1. Authenticate Admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@assetflow.com', password: 'admin123' })
      .expect(201);
    adminToken = adminRes.body.accessToken;

    // 2. Authenticate Manager
    const mgrRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'manager@assetflow.com', password: 'manager123' })
      .expect(201);
    managerToken = mgrRes.body.accessToken;

    // 3. Authenticate Employee
    const empRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'employee@assetflow.com', password: 'employee123' })
      .expect(201);
    employeeToken = empRes.body.accessToken;
  });

  afterAll(async () => {
    try {
      if (createdAssignmentId) {
        await prisma.assetAssignment.deleteMany({
          where: { id: createdAssignmentId },
        });
      }
      if (createdAssetId) {
        await prisma.assetHistory.deleteMany({
          where: { assetId: createdAssetId },
        });
        await prisma.assetAssignment.deleteMany({
          where: { assetId: createdAssetId },
        });
        await prisma.asset.deleteMany({
          where: { id: createdAssetId },
        });
      }
      if (createdEmployeeId) {
        await prisma.employee.deleteMany({
          where: { id: createdEmployeeId },
        });
      }
    } catch {
      // teardown error ignore
    } finally {
      await app.close();
    }
  });

  describe('ADMIN Role Permissions', () => {
    it('Admin can add a new asset (POST /assets)', async () => {
      const res = await request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          assetTag: `RBAC-AST-${testSuffix}`,
          name: 'RBAC Test Asset',
          category: 'Laptops',
          brand: 'Lenovo',
          status: 'available',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      createdAssetId = res.body.id;
    });

    it('Admin can edit an asset (PUT /assets/:id)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated RBAC Test Asset',
        })
        .expect(200);

      expect(res.body.name).toBe('Updated RBAC Test Asset');
    });

    it('Admin can create an employee (POST /employees)', async () => {
      const res = await request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeNo: `RBAC-EMP-${testSuffix}`,
          firstName: 'Robert',
          lastName: 'AdminCreated',
          email: `rbac.${testSuffix}@company.com`,
          department: 'Security',
          position: 'Security Officer',
          isActive: true,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      createdEmployeeId = res.body.id;
    });

    it('Admin can create an assignment (POST /assignments)', async () => {
      const res = await request(app.getHttpServer())
        .post('/assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          assetId: createdAssetId,
          employeeId: createdEmployeeId,
          notes: 'Assigned by Admin',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      createdAssignmentId = res.body.id;
    });
  });

  describe('MANAGER Role Permissions', () => {
    it('Manager can view all assets (GET /assets)', async () => {
      const res = await request(app.getHttpServer())
        .get('/assets')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('Manager can process returns (POST /returns)', async () => {
      const res = await request(app.getHttpServer())
        .post('/returns')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          assignmentId: createdAssignmentId,
          condition: 'GOOD',
          notes: 'Returned by Manager',
        })
        .expect(201);

      expect(res.body.status).toBe('RETURNED');
    });

    it('Manager can re-assign the returned asset (POST /assignments)', async () => {
      const res = await request(app.getHttpServer())
        .post('/assignments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          assetId: createdAssetId,
          employeeId: createdEmployeeId,
          notes: 'Assigned by Manager',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      createdAssignmentId = res.body.id;
    });

    it('Manager CANNOT delete an asset (DELETE /assets/:id) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('Manager CANNOT delete an employee (DELETE /employees/:id) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .delete(`/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });

    it('Manager CANNOT delete a category (DELETE /categories/:id) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .delete('/categories/1')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });
  });

  describe('EMPLOYEE Role Permissions & Self-Service', () => {
    it('Employee can view their own profile (GET /employee-portal/profile)', async () => {
      const res = await request(app.getHttpServer())
        .get('/employee-portal/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('employeeNo', 'EMP-000');
      expect(res.body).toHaveProperty('email', 'employee@assetflow.com');
    });

    it('Employee can view their own dashboard metrics (GET /employee-portal/dashboard)', async () => {
      const res = await request(app.getHttpServer())
        .get('/employee-portal/dashboard')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('summary');
      expect(res.body.summary).toHaveProperty('assignedAssetsCount');
      expect(res.body.employee).toHaveProperty('firstName', 'John');
    });

    it('Employee can view their own assigned assets (GET /employee-portal/assets)', async () => {
      const res = await request(app.getHttpServer())
        .get('/employee-portal/assets')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].status).toBe('assigned');
      }
    });

    it('Employee CANNOT view all assets (GET /assets) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/assets')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });

    it('Employee CANNOT add an asset (POST /assets) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ assetTag: 'HACK-01', name: 'Hack Laptop', category: 'Laptops' })
        .expect(403);
    });

    it('Employee CANNOT assign an asset (POST /assignments) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/assignments')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ assetId: 1, employeeId: 1 })
        .expect(403);
    });

    it('Employee CANNOT access global dashboard summary (GET /dashboard/summary) -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });
  });
});
