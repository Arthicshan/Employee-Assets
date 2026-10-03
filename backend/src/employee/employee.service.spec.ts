import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
  });
});
