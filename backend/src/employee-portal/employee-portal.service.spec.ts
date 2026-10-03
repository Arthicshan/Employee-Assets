import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeePortalService } from './employee-portal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmployeePortalService', () => {
  let service: EmployeePortalService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      employee: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      asset: {
        findMany: jest.fn(),
      },
      assetAssignment: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      assetHistory: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeePortalService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<EmployeePortalService>(EmployeePortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return employee profile by employeeId', async () => {
      const mockEmployee = {
        id: 10,
        employeeNo: 'EMP-001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@company.com',
        department: 'Engineering',
        position: 'Architect',
        isActive: true,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await service.getProfile(1, 10);
      expect(result).toEqual(mockEmployee);
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
      });
    });

    it('should throw NotFoundException if no employee found', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 99,
        email: 'ghost@company.com',
        employee: null,
      });

      await expect(service.getProfile(99, undefined)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyAssets', () => {
    it('should return only assets assigned to the employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 5 });
      const mockAssets = [
        { id: 101, assetTag: 'LAP-001', status: 'assigned', employeeId: 5 },
      ];
      mockPrisma.asset.findMany.mockResolvedValue(mockAssets);

      const result = await service.getMyAssets(1, 5);
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith({
        where: {
          employeeId: 5,
          status: 'assigned',
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(mockAssets);
    });
  });

  describe('getMyDashboard', () => {
    it('should return aggregated metrics for the authenticated employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 5,
        employeeNo: 'EMP-005',
        firstName: 'Eve',
        lastName: 'Davis',
        email: 'eve@company.com',
        department: 'HR',
        position: 'Manager',
      });
      mockPrisma.asset.findMany.mockResolvedValue([
        { id: 1, name: 'MacBook' },
      ]);
      mockPrisma.assetAssignment.count.mockResolvedValue(3);
      mockPrisma.assetAssignment.findMany.mockResolvedValue([
        { id: 10, asset: { name: 'MacBook' } },
      ]);

      const result = await service.getMyDashboard(1, 5);
      expect(result.summary.assignedAssetsCount).toBe(1);
      expect(result.summary.totalAssignmentsCount).toBe(3);
      expect(result.employee.firstName).toBe('Eve');
    });
  });
});
