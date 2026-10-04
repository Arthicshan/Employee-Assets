import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReturnsService', () => {
  let service: ReturnsService;

  const mockPrisma = {
    assetAssignment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    asset: {
      findUnique: jest.fn().mockResolvedValue({status: 'assigned'}),
      update: jest.fn(),
    },
    assetHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReturnsService>(ReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create return rules', () => {
    it('should throw NotFoundException if assignment does not exist', async () => {
      mockPrisma.assetAssignment.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ assignmentId: 999, condition: 'GOOD' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject return if assignment is already returned', async () => {
      mockPrisma.assetAssignment.findUnique.mockResolvedValue({
        id: 1,
        status: 'RETURNED',
      });

      await expect(
        service.create({ assignmentId: 1, condition: 'GOOD' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return asset as available when condition is GOOD', async () => {
      mockPrisma.assetAssignment.findUnique.mockResolvedValue({
        id: 1,
        assetId: 5,
        employeeId: 10,
        status: 'ACTIVE',
      });
      mockPrisma.assetAssignment.update.mockResolvedValue({
        id: 1,
        status: 'RETURNED',
      });

      await service.create({
        assignmentId: 1,
        condition: 'GOOD',
        notes: 'Returned in good condition',
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          status: 'available',
          condition: 'GOOD',
          employeeId: null,
        },
      });
      expect(mockPrisma.assetHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assetId: 5,
          employeeId: 10,
          action: 'RETURNED',
        }),
      });
    });

    it('should return asset as damaged when condition is DAMAGED', async () => {
      mockPrisma.assetAssignment.findUnique.mockResolvedValue({
        id: 1,
        assetId: 5,
        employeeId: 10,
        status: 'ACTIVE',
      });

      await service.create({
        assignmentId: 1,
        condition: 'DAMAGED',
        notes: 'Cracked screen reported',
      });

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          status: 'damaged',
          condition: 'DAMAGED',
          employeeId: null,
        },
      });
    });
  });
});
