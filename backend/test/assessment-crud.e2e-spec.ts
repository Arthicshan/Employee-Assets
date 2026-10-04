import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, getAuthToken } from './setup-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Assessment CRUD and lifecycle regressions', () => {
  let app: INestApplication, prisma: PrismaService, admin: string, manager: string;
  let categoryId: number, employeeId: number, assetId: number, assignmentId: number, userId: number;
  const prefix = `AUDIT-${Date.now()}`;
  let category = `${prefix}-Category`;
  const employee = {employeeNo: `${prefix}-EMP`, firstName: 'Audit', lastName: 'Employee', email: `${prefix.toLowerCase()}@company.com`, department: 'QA', position: 'Tester'};
  const asset = () => ({assetTag: `${prefix}-AST`, name: 'Audit Laptop', category, serialNumber: '', purchaseDate: '', condition: 'NEW', purchasePrice: 1200, warrantyExpiryDate: '2027-01-01'});
  const api = () => request(app.getHttpServer());
  const get = (path: string) => api().get(path).set('Authorization', `Bearer ${admin}`);
  const post = (path: string, data: object) => api().post(path).set('Authorization', `Bearer ${admin}`).send(data);
  const patch = (path: string, data: object, token = admin) => api().patch(path).set('Authorization', `Bearer ${token}`).send(data);
  const del = (path: string) => api().delete(path).set('Authorization', `Bearer ${admin}`);

  beforeAll(async () => {
    app = await createTestApp(); prisma = app.get(PrismaService);
    admin = await getAuthToken(app); manager = await getAuthToken(app, 'manager@assetflow.com', 'manager123');
  });
  afterAll(async () => { await app.close(); });

  it('creates, reads and updates a category', async () => {
    const created = await post('/categories', {name: category, description: 'Assessment category'}).expect(201);
    categoryId = created.body.id;
    expect((await get(`/categories/${categoryId}`).expect(200)).body.name).toBe(category);
    await patch(`/categories/${categoryId}`, {description: 'Updated category'}).expect(200);
  });
  it('validates category payloads and reports duplicate names as conflict', async () => {
    const invalid = await post('/categories', {name: '   ', active: 'yes'}).expect(400);
    expect(invalid.body.validationErrors.length).toBeGreaterThan(0);
    await patch(`/categories/${categoryId}`, {name: ''}).expect(400);
    await post('/categories', {name: category}).expect(409);
  });
  it('creates, reads, updates and searches employees', async () => {
    employeeId = (await post('/employees', employee).expect(201)).body.id;
    expect((await get(`/employees/${employeeId}`).expect(200)).body.employeeNo).toBe(employee.employeeNo);
    await api().put(`/employees/${employeeId}`).set('Authorization', `Bearer ${admin}`).send({department: 'Audit QA'}).expect(200);
    const list = await get(`/employees?search=${prefix}&page=1&limit=1&sortBy=employeeNo&sortOrder=asc`).expect(200);
    expect(list.body.meta.total).toBe(1); expect(list.body.data[0].id).toBe(employeeId);
    await post('/employees', employee).expect(409);
  });
  it('creates assets with optional blank dates and serials, storing condition, price and warranty', async () => {
    const created = await post('/assets', asset()).expect(201); assetId = created.body.id;
    expect(created.body).toMatchObject({serialNumber: null, purchaseDate: null, condition: 'NEW', purchasePrice: 1200});
    expect(created.body.warrantyExpiryDate).toContain('2027-01-01');
    const second = await post('/assets', {...asset(), assetTag: `${prefix}-SECOND`}).expect(201);
    expect(second.body.serialNumber).toBeNull();
    await del(`/assets/${second.body.id}`).expect(200);
  });
  it('rejects duplicate asset codes, invalid category, dates and negative prices', async () => {
    await post('/assets', asset()).expect(409);
    await post('/assets', {...asset(), assetTag: `${prefix}-BAD`, category: 'Missing category'}).expect(400);
    await post('/assets', {...asset(), assetTag: `${prefix}-BAD`, purchasePrice: -1}).expect(400);
    await post('/assets', {...asset(), assetTag: `${prefix}-BAD`, purchaseDate: 'nonsense'}).expect(400);
    await post('/assets', {...asset(), assetTag: `${prefix}-BAD`, status: 'assigned'}).expect(400);
    await patch(`/assets/${assetId}`, {status: null}).expect(400);
    await patch(`/assets/${assetId}`, {condition: null}).expect(400);
    await api().put(`/employees/${employeeId}`).set('Authorization', `Bearer ${admin}`).send({isActive: null}).expect(400);
  });
  it('updates optional asset fields and enforces serial uniqueness', async () => {
    await patch(`/assets/${assetId}`, {serialNumber: `${prefix}-SERIAL`, purchasePrice: 900, notes: 'Inspection note'}).expect(200);
    await post('/assets', {...asset(), assetTag: `${prefix}-DUPSERIAL`, serialNumber: `${prefix}-SERIAL`}).expect(409);
    await patch(`/assets/${assetId}`, {purchaseDate: '', warrantyExpiryDate: ''}).expect(200);
    expect((await get(`/assets/${assetId}`).expect(200)).body.warrantyExpiryDate).toBeNull();
  });
  it('supports code/serial/model search, category and status filters, sorting and pagination', async () => {
    const list = await get(`/assets?search=${prefix}-SERIAL&page=1&limit=1&sortBy=assetTag&sortOrder=asc`).expect(200);
    expect(list.body.meta.total).toBe(1); expect(list.body.data[0].id).toBe(assetId);
    const filtered = await get(`/assets?category=${encodeURIComponent(category)}&status=AVAILABLE`).expect(200);
    expect(filtered.body).toHaveLength(1);
    await get('/assets?page=0').expect(400); await get('/assets?limit=1000').expect(400);
    await get('/assets?sortBy=passwordHash').expect(400); await get('/assets?status=invalid').expect(400);
  });
  it('category rename cascades to assets and referenced categories cannot be deleted', async () => {
    category += '-Renamed'; await patch(`/categories/${categoryId}`, {name: category}).expect(200);
    expect((await get(`/assets/${assetId}`).expect(200)).body.category).toBe(category);
    await del(`/categories/${categoryId}`).expect(409);
  });
  it('inactive categories are rejected for asset registration', async () => {
    await patch(`/categories/${categoryId}`, {active: false}).expect(200);
    await post('/assets', {...asset(), assetTag: `${prefix}-INACTIVE`}).expect(400);
    await patch(`/categories/${categoryId}`, {active: true}).expect(200);
  });
  it('manager can mark damaged, repair and recover assets with audited status transitions', async () => {
    for (const status of ['damaged','under_repair','available']) await patch(`/assets/${assetId}/status`, {status}, manager).expect(200);
    const history = await get(`/assets/${assetId}/history`).expect(200);
    expect(history.body.filter((row: {action: string}) => row.action === 'STATUS_CHANGED')).toHaveLength(3);
    expect(history.body[0]).toMatchObject({previousStatus: 'under_repair', newStatus: 'available'});
    await patch(`/assets/${assetId}/status`, {name: 'Cannot edit specs'}, manager).expect(400);
  });
  it('assignment cannot be bypassed through asset update or old direct assignment endpoints', async () => {
    await patch(`/assets/${assetId}`, {status: 'assigned'}).expect(400);
    await api().put(`/employees/${employeeId}`).set('Authorization', `Bearer ${admin}`).send({isActive: false}).expect(200);
    await patch(`/assets/${assetId}/assign/${employeeId}`, {}).expect(400);
    await api().put(`/employees/${employeeId}`).set('Authorization', `Bearer ${admin}`).send({isActive: true}).expect(200);
    const assigned = await patch(`/assets/${assetId}/assign/${employeeId}`, {}).expect(200);
    expect(assigned.body.status).toBe('assigned');
    assignmentId = (await prisma.assetAssignment.findFirstOrThrow({where: {assetId, status: 'ACTIVE'}})).id;
    expect(await prisma.assetHistory.count({where: {assetId, action: 'ASSIGNED'}})).toBe(1);
    await patch(`/assets/${assetId}/assign/${employeeId}`, {}).expect(400);
  });
  it('active assignment prevents retirement and available status edits', async () => {
    await del(`/assets/${assetId}`).expect(400);
    await patch(`/assets/${assetId}`, {status: 'available'}).expect(400);
    expect((await get(`/assets/${assetId}`).expect(200)).body.employeeId).toBe(employeeId);
    const filtered = await get(`/assets?employeeId=${employeeId}`).expect(200);
    expect(filtered.body[0].id).toBe(assetId);
  });
  it('damaged return saves inspection fields and preserves original assignment notes', async () => {
    await post('/returns', {assignmentId, condition: 'DAMAGED', notes: 'Cracked display'}).expect(201);
    const returned = await get(`/assignments/${assignmentId}`).expect(200);
    expect(returned.body).toMatchObject({status: 'RETURNED', returnCondition: 'DAMAGED', returnNotes: 'Cracked display'});
    expect((await get(`/assets/${assetId}`).expect(200)).body).toMatchObject({status: 'damaged', condition: 'DAMAGED', employeeId: null});
    await post('/returns', {assignmentId, condition: 'GOOD'}).expect(400);
    await post('/assignments', {assetId, employeeId}).expect(400);
  });
  it('explicit repair and recovery permit reassignment with the supplied date', async () => {
    await patch(`/assets/${assetId}/status`, {status: 'under_repair'}, manager).expect(200);
    await patch(`/assets/${assetId}/status`, {status: 'available'}, manager).expect(200);
    const assigned = await post('/assignments', {assetId, employeeId, assignedAt: '2026-01-01T10:00:00Z', notes: 'Original assignment note'}).expect(201);
    assignmentId = assigned.body.id; expect(assigned.body.assignedAt).toBe('2026-01-01T10:00:00.000Z');
    await post('/returns', {assignmentId, condition: 'GOOD', returnedAt: '2025-12-01'}).expect(400);
    expect((await get(`/assignments/${assignmentId}`).expect(200)).body.status).toBe('ACTIVE');
  });
  it('concurrent returns produce one event and one successful return', async () => {
    const responses = await Promise.all([post('/returns', {assignmentId, condition: 'GOOD', notes: 'First return'}), post('/returns', {assignmentId, condition: 'GOOD', notes: 'Second return'})]);
    expect(responses.filter(res => res.status === 201)).toHaveLength(1);
    expect(responses.every(res => [201,400,409].includes(res.status))).toBe(true);
    expect((await get(`/assignments/${assignmentId}`).expect(200)).body.notes).toBe('Original assignment note');
    expect(await prisma.assetHistory.count({where: {assetId, action: 'RETURNED'}})).toBe(2);
  });
  it('rolls back assignment and status if the audit write fails', async () => {
    await prisma.$executeRawUnsafe(`ALTER TABLE "AssetHistory" ADD CONSTRAINT "assessment_reject_assignment" CHECK ("assetId" != ${assetId} OR "action" != 'ASSIGNED') NOT VALID`);
    try {
      await post('/assignments', {assetId, employeeId}).expect(500);
      expect((await get(`/assets/${assetId}`).expect(200)).body.status).toBe('available');
      expect(await prisma.assetAssignment.count({where: {assetId, status: 'ACTIVE'}})).toBe(0);
    } finally {
      await prisma.$executeRawUnsafe('ALTER TABLE "AssetHistory" DROP CONSTRAINT "assessment_reject_assignment"');
    }
  });
  it('concurrent assignments leave exactly one active owner and one event', async () => {
    const responses = await Promise.all([post('/assignments', {assetId, employeeId}), post('/assignments', {assetId, employeeId})]);
    expect(responses.filter(res => res.status === 201)).toHaveLength(1);
    expect(responses.every(res => [201,400,409].includes(res.status))).toBe(true);
    expect(await prisma.assetAssignment.count({where: {assetId, status: 'ACTIVE'}})).toBe(1);
    expect(await prisma.assetHistory.count({where: {assetId, action: 'ASSIGNED'}})).toBe(3);
  });
  it('legacy unassignment closes assignment and records history', async () => {
    await patch(`/assets/${assetId}/unassign`, {}).expect(200);
    expect(await prisma.assetAssignment.count({where: {assetId, status: 'ACTIVE'}})).toBe(0);
    expect((await get(`/assets/${assetId}`).expect(200)).body.status).toBe('available');
    await patch(`/assets/${assetId}/unassign`, {}).expect(400);
  });
  it('retires assets without deleting audit records and requires explicit reactivation', async () => {
    const before = await prisma.assetHistory.count({where: {assetId}});
    await del(`/assets/${assetId}`).expect(200);
    expect((await get(`/assets/${assetId}`).expect(200)).body.status).toBe('retired');
    expect(await prisma.assetHistory.count({where: {assetId}})).toBe(before + 1);
    await post('/assignments', {assetId, employeeId}).expect(400);
    await patch(`/assets/${assetId}/status`, {status: 'available'}).expect(200);
  });
  it('employee deletion preserves referenced history by deactivating their record', async () => {
    const removed = await del(`/employees/${employeeId}`).expect(200); expect(removed.body.isActive).toBe(false);
    expect((await get(`/employees/${employeeId}`).expect(200)).body.assignments.length).toBeGreaterThan(0);
    await post('/assignments', {assetId, employeeId}).expect(400);
  });
  it('deletes an unused employee and category', async () => {
    const emp = await post('/employees', {...employee, employeeNo: `${prefix}-UNUSED`, email: `${prefix.toLowerCase()}-unused@company.com`}).expect(201);
    await del(`/employees/${emp.body.id}`).expect(200); await get(`/employees/${emp.body.id}`).expect(404);
    const cat = await post('/categories', {name: `${prefix}-Unused`}).expect(201);
    await del(`/categories/${cat.body.id}`).expect(200); await get(`/categories/${cat.body.id}`).expect(404);
  });
  it('creates, reads and updates users without exposing password hashes', async () => {
    const created = await post('/users', {email: `${prefix.toLowerCase()}-user@company.com`, firstName: 'Audit', lastName: 'User', role: 'MANAGER', password: 'AuditPass123!'}).expect(201);
    userId = created.body.id; expect(created.body.passwordHash).toBeUndefined();
    expect((await get(`/users/${userId}`).expect(200)).body.role).toBe('MANAGER');
    await patch(`/users/${userId}`, {position: 'QA Manager', password: 'ChangedPass123!'}).expect(200);
    const login = await api().post('/auth/login').send({email: created.body.email, password: 'ChangedPass123!'}).expect(201);
    expect(login.body.user.role).toBe('MANAGER');
    await post('/users', {email: created.body.email, firstName: 'Other', lastName: 'User'}).expect(409);
  });
  it('role and active-state edits take effect immediately for issued tokens', async () => {
    const email = `${prefix.toLowerCase()}-user@company.com`;
    const login = await api().post('/auth/login').send({email, password: 'ChangedPass123!'}).expect(201);
    await patch(`/users/${userId}`, {role: 'EMPLOYEE'}).expect(200);
    await api().get('/assets').set('Authorization', `Bearer ${login.body.accessToken}`).expect(403);
    await patch(`/users/${userId}/status`, {}).expect(200);
    await api().get('/auth/profile').set('Authorization', `Bearer ${login.body.accessToken}`).expect(401);
    await api().post('/auth/login').send({email, password: 'ChangedPass123!'}).expect(401);
  });
  it('deletes users without exposing credentials and blocks self deletion', async () => {
    const result = await del(`/users/${userId}`).expect(200); expect(result.body.passwordHash).toBeUndefined();
    await get(`/users/${userId}`).expect(404);
    const me = await get('/auth/profile').expect(200); await del(`/users/${me.body.id}`).expect(400);
  });
  it('dashboard counts match stored inventory and include all six states and recent events', async () => {
    const summary = await get('/dashboard/summary').expect(200);
    expect(summary.body.totalAssets).toBe(await prisma.asset.count());
    expect(summary.body.byStatus).toHaveLength(6);
    expect(summary.body.byStatus.reduce((sum: number, row: {count: number}) => sum + row.count, 0)).toBe(summary.body.totalAssets);
    expect(summary.body.byCategory.reduce((sum: number, row: {count: number}) => sum + row.count, 0)).toBe(summary.body.totalAssets);
    expect(summary.body.recentActivity.length).toBeGreaterThan(0); expect(summary.body.recentAssignments.length).toBeGreaterThan(0);
  });
  it('validates list query and IDs, returns missing records as 404, keeps history read-only', async () => {
    for (const path of ['/assets','/employees','/categories','/users']) {
      await get(`${path}/nonsense`).expect(400); await get(`${path}/2147483000`).expect(404);
      await get(`${path}?page=abc`).expect(400);
      const paged = await get(`${path}?page=1&limit=1`).expect(200); expect(paged.body.data.length).toBeLessThanOrEqual(1);
    }
    const firstPage = await get('/assignments?page=1&limit=1&sortBy=id&sortOrder=asc').expect(200);
    const secondPage = await get('/assignments?page=2&limit=1&sortBy=id&sortOrder=asc').expect(200);
    expect(firstPage.body.data[0].id).not.toBe(secondPage.body.data[0].id);
    expect(firstPage.body.meta.limit).toBe(1);
    await get('/assignments?status=invalid').expect(400); await get('/assignments?page=-1').expect(400);
    await patch(`/asset-history/${assetId}`, {notes: 'Cannot alter history'}).expect(404);
    await get('/health').expect(200);
  });
});
