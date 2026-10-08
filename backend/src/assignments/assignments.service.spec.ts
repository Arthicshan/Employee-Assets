import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  const mockPrisma: any = {
    employee: {
      findUnique: jest.fn(),
    },
    asset: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    assetAssignment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    assetHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: any) => any) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create assignment rules', () => {
    const validDto = {
      assetId: 1,
      employeeId: 10,
      notes: 'Standard issue laptop',
    };

    it('should throw NotFoundException if employee does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    });

    it('should reject assignment if employee is inactive', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
        isActive: false,
      });

      await expect(service.create(validDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(validDto)).rejects.toThrow(/inactive employee/i);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(NotFoundException);
    });

    it('should reject assignment if asset status is not available', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue({
        id: 1,
        status: 'assigned',
      });

      await expect(service.create(validDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(validDto)).rejects.toThrow(/only available assets can be assigned/i);
    });

    it('should reject assignment if asset already has an active assignment', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue({
        id: 1,
        status: 'available',
      });
      mockPrisma.assetAssignment.findFirst.mockResolvedValue({
        id: 99,
        status: 'ACTIVE',
      });

      await expect(service.create(validDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(validDto)).rejects.toThrow(/already has an active assignment/i);
    });

    it('should successfully assign available asset to active employee using Prisma transaction', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue({
        id: 1,
        status: 'available',
      });
      mockPrisma.assetAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.assetAssignment.create.mockResolvedValue({
        id: 100,
        assetId: 1,
        employeeId: 10,
        status: 'ACTIVE',
      });

      const result = await service.create(validDto);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.assetAssignment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assetId: 1,
          employeeId: 10,
          status: 'ACTIVE',
        }),
        include: expect.any(Object),
      });
      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'assigned', employeeId: 10 },
      });
      expect(mockPrisma.assetHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assetId: 1,
          employeeId: 10,
          action: 'ASSIGNED',
        }),
      });
      expect(result).toHaveProperty('id', 100);
    });
  });
});
