import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './setup-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Core Business Flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testSuffix = Date.now().toString().slice(-6);
  const activeEmployeeNo = `EMP-E2E-ACT-${testSuffix}`;
  const inactiveEmployeeNo = `EMP-E2E-INA-${testSuffix}`;
  const assetTag1 = `TAG-E2E-1-${testSuffix}`;
  const assetTag2 = `TAG-E2E-2-${testSuffix}`;

  let createdActiveEmployeeId: number;
  let createdInactiveEmployeeId: number;
  let createdAsset1Id: number;
  let createdAsset2Id: number;
  let createdAssignmentId: number;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data in reverse dependency order
    try {
      const assetIds = [createdAsset1Id, createdAsset2Id].filter(Boolean);
      if (assetIds.length > 0) {
        await prisma.assetHistory.deleteMany({
          where: { assetId: { in: assetIds } },
        });
        await prisma.assetAssignment.deleteMany({
          where: { assetId: { in: assetIds } },
        });
        await prisma.asset.deleteMany({
          where: { id: { in: assetIds } },
        });
      }
      const empIds = [createdActiveEmployeeId, createdInactiveEmployeeId].filter(Boolean);
      if (empIds.length > 0) {
        await prisma.employee.deleteMany({
          where: { id: { in: empIds } },
        });
      }
    } catch {
      // Ignore cleanup error in teardown
    } finally {
      await app.close();
    }
  });

  // Flow 1: GET /health
  it('Flow 1: GET /health returns status ok and database connected', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('database', 'connected');
  });

  // Flow 2: Asset creation
  it('Flow 2: POST /assets creates a new available asset', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/assets')
      .send({
        assetTag: assetTag1,
        name: 'Dell Latitude E2E Test 1',
        category: 'Laptops',
        brand: 'Dell',
        model: 'Latitude 7420',
        serialNumber: `SN-1-${testSuffix}`,
        status: 'available',
      })
      .expect(201);

    expect(res1.body).toHaveProperty('id');
    expect(res1.body.assetTag).toBe(assetTag1);
    expect(res1.body.status.toLowerCase()).toBe('available');
    createdAsset1Id = res1.body.id;

    // Create a second asset for inactive employee test
    const res2 = await request(app.getHttpServer())
      .post('/assets')
      .send({
        assetTag: assetTag2,
        name: 'Dell Latitude E2E Test 2',
        category: 'Laptops',
        brand: 'Dell',
        model: 'Latitude 7430',
        serialNumber: `SN-2-${testSuffix}`,
        status: 'available',
      })
      .expect(201);

    createdAsset2Id = res2.body.id;
  });

  // Flow 3: Employee creation (active and inactive)
  it('Flow 3: POST /employees creates active and inactive employees', async () => {
    // 3a. Active employee
    const activeRes = await request(app.getHttpServer())
      .post('/employees')
      .send({
        employeeNo: activeEmployeeNo,
        firstName: 'Active',
        lastName: 'Tester',
        email: `active.${testSuffix}@company.com`,
        department: 'Quality Assurance',
        position: 'E2E Test Engineer',
        isActive: true,
      })
      .expect(201);

    expect(activeRes.body).toHaveProperty('id');
    expect(activeRes.body.isActive).toBe(true);
    createdActiveEmployeeId = activeRes.body.id;

    // 3b. Inactive employee
    const inactiveRes = await request(app.getHttpServer())
      .post('/employees')
      .send({
        employeeNo: inactiveEmployeeNo,
        firstName: 'Inactive',
        lastName: 'FormerTester',
        email: `inactive.${testSuffix}@company.com`,
        department: 'Quality Assurance',
        position: 'Former Engineer',
        isActive: false,
      })
      .expect(201);

    expect(inactiveRes.body).toHaveProperty('id');
    expect(inactiveRes.body.isActive).toBe(false);
    createdInactiveEmployeeId = inactiveRes.body.id;
  });

  // Flow 4: Successful asset assignment
  it('Flow 4: POST /assignments successfully assigns available asset to active employee', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        assetId: createdAsset1Id,
        employeeId: createdActiveEmployeeId,
        notes: 'Initial assignment for E2E testing',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.assetId).toBe(createdAsset1Id);
    expect(res.body.employeeId).toBe(createdActiveEmployeeId);
    expect(res.body.returnedAt).toBeNull();
    createdAssignmentId = res.body.id;

    // Verify asset status transitioned to 'assigned'
    const assetCheck = await request(app.getHttpServer())
      .get(`/assets/${createdAsset1Id}`)
      .expect(200);

    expect(assetCheck.body.status.toLowerCase()).toBe('assigned');
  });

  // Flow 5: Rejected assignment for inactive employee
  it('Flow 5: POST /assignments rejects assignment to an inactive employee with 400 Bad Request', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        assetId: createdAsset2Id,
        employeeId: createdInactiveEmployeeId,
        notes: 'Attempt assigning to inactive employee',
      })
      .expect(400);

    const errorMessage = res.body.detail || res.body.message || JSON.stringify(res.body);
    expect(errorMessage.toLowerCase()).toContain('inactive');
  });

  // Flow 6: Rejected assignment for unavailable asset
  it('Flow 6: POST /assignments rejects assignment for an already assigned/unavailable asset with 400 Bad Request', async () => {
    // createdAsset1Id is already 'assigned' from Flow 4
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        assetId: createdAsset1Id,
        employeeId: createdActiveEmployeeId,
        notes: 'Attempt assigning already assigned asset',
      })
      .expect(400);

    const errorMessage = res.body.detail || res.body.message || JSON.stringify(res.body);
    expect(errorMessage.toLowerCase()).toContain('available');
  });

  // Flow 7: Successful asset return
  it('Flow 7: POST /returns successfully returns an assigned asset and sets status back to available', async () => {
    const res = await request(app.getHttpServer())
      .post('/returns')
      .send({
        assignmentId: createdAssignmentId,
        condition: 'GOOD',
        notes: 'Asset returned in good condition',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', createdAssignmentId);
    expect(res.body.status).toBe('RETURNED');
    expect(res.body.returnedAt).toBeTruthy();

    // Verify asset status reverted to 'available'
    const assetCheck = await request(app.getHttpServer())
      .get(`/assets/${createdAsset1Id}`)
      .expect(200);

    expect(assetCheck.body.status.toLowerCase()).toBe('available');
  });

  // Flow 8: Asset history retrieval
  it('Flow 8: GET /asset-history and GET /asset-history/asset/:id retrieves lifecycle history records', async () => {
    // 8a. Global asset history
    const allHistoryRes = await request(app.getHttpServer())
      .get('/asset-history')
      .expect(200);

    expect(Array.isArray(allHistoryRes.body)).toBe(true);
    expect(allHistoryRes.body.length).toBeGreaterThan(0);

    // 8b. Specific asset history for createdAsset1Id
    const assetHistoryRes = await request(app.getHttpServer())
      .get(`/asset-history/asset/${createdAsset1Id}`)
      .expect(200);

    expect(Array.isArray(assetHistoryRes.body)).toBe(true);
    const actions = assetHistoryRes.body.map((h: any) => h.action.toUpperCase());
    expect(actions).toContain('ASSIGNED');
    expect(actions).toContain('RETURNED');
  });
});
