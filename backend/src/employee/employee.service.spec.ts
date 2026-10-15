import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmployeeService', () => {
  let service: EmployeeService;

  const mockPrisma = {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    assetAssignment: {
      count: jest.fn().mockResolvedValue(0),
    },
    assetHistory: {
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query employees with search keyword across multiple fields', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 1, firstName: 'Alice', employeeNo: 'EMP-001' },
      ]);

      const result = (await service.findAll({ search: 'Alice' })) as unknown[];
      expect(result).toHaveLength(1);
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { firstName: { contains: 'Alice', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should return paginated structure when pagination query parameters are provided', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 1, firstName: 'Alice', employeeNo: 'EMP-001' },
      ]);
      mockPrisma.employee.count.mockResolvedValue(1);

      const result = (await service.findAll({ page: 1, limit: 10 })) as {
        data: unknown[];
        meta: unknown;
      };
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by active status correctly', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await service.findAll({ status: 'ACTIVE' });
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it('should throw BadRequestException for invalid status values', async () => {
      await expect(service.findAll({ status: 'PENDING' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create an active employee by default', async () => {
      const dto = {
        employeeNo: 'EMP-001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@company.com',
        department: 'Engineering',
        position: 'Software Architect',
      };

      mockPrisma.employee.create.mockResolvedValue({
        id: 1,
        ...dto,
        isActive: true,
      });

      const result = await service.create(dto);
      expect(mockPrisma.employee.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          employeeNo: 'EMP-001',
          isActive: true,
        }),
      });
      expect(result.isActive).toBe(true);
    });

    it('should allow explicitly creating an inactive employee', async () => {
      const dto = {
        employeeNo: 'EMP-002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@company.com',
        department: 'Operations',
        position: 'Former Contractor',
        isActive: false,
      };

      mockPrisma.employee.create.mockResolvedValue({
        id: 2,
        ...dto,
      });

      const result = await service.create(dto);
      expect(mockPrisma.employee.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: false,
        }),
      });
      expect(result.isActive).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when employee does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should return employee if found', async () => {
      const employee = { id: 1, employeeNo: 'EMP-001', firstName: 'Alice' };
      mockPrisma.employee.findUnique.mockResolvedValue(employee);

      const result = await service.findOne(1);
      expect(result).toEqual(employee);
    });
  });

  describe('remove', () => {
    it('should soft delete employee if referenced in assignments or history', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 1, firstName: 'Alice' });
      mockPrisma.assetAssignment.count.mockResolvedValue(2);
      mockPrisma.assetHistory.count.mockResolvedValue(1);
      mockPrisma.employee.update.mockResolvedValue({ id: 1, isActive: false });

      const result = await service.remove(1);
      expect(mockPrisma.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
      expect(mockPrisma.employee.delete).not.toHaveBeenCalled();
    });

    it('should hard delete employee if no assignments or history reference them', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 2, firstName: 'Bob' });
      mockPrisma.assetAssignment.count.mockResolvedValue(0);
      mockPrisma.assetHistory.count.mockResolvedValue(0);
      mockPrisma.employee.delete.mockResolvedValue({ id: 2 });

      await service.remove(2);
      expect(mockPrisma.employee.delete).toHaveBeenCalledWith({ where: { id: 2 } });
    });
  });
});
