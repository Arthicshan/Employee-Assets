import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AssignmentsService } from '../assignments/assignments.service';
import { ReturnsService } from '../returns/returns.service';
import { AssetService } from './asset.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssetService', () => {
  let service: AssetService;

  const mockPrisma: any = {
    asset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: any) => any) => callback(mockPrisma)),
    assetCategory: {
      findUnique: jest.fn().mockResolvedValue({ name: 'Laptops', active: true }),
      findFirst: jest.fn().mockResolvedValue({ name: 'Laptops', active: true }),
    },
    assetAssignment: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    assetHistory: { create: jest.fn() },
    employee: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {provide: AssignmentsService, useValue: {create: jest.fn()}},
        {provide: ReturnsService, useValue: {create: jest.fn()}},
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an asset with available status by default', async () => {
      const dto = {
        assetTag: 'LAP-001',
        name: 'MacBook Pro',
        category: 'Laptops',
      };

      mockPrisma.asset.create.mockResolvedValue({
        id: 1,
        ...dto,
        status: 'available',
      });

      const result = await service.create(dto);
      expect(mockPrisma.asset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assetTag: 'LAP-001',
          name: 'MacBook Pro',
          category: 'Laptops',
          status: 'available',
        }),
      });
      expect(result.status).toBe('available');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if asset does not exist', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.asset.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 999 },
        }),
      );
    });

    it('should return asset if found', async () => {
      const asset = { id: 1, assetTag: 'LAP-001', name: 'MacBook Pro' };
      mockPrisma.asset.findUnique.mockResolvedValue(asset);

      const result = await service.findOne(1);
      expect(result).toEqual(asset);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if asset to update is not found', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if setting status to assigned directly', async () => {
      mockPrisma.asset.findUnique.mockResolvedValue({ id: 1, status: 'available', category: 'Laptops' });

      await expect(service.update(1, { status: 'assigned' })).rejects.toThrow(BadRequestException);
    });

    it('should update asset and log status change in history when status is modified', async () => {
      const existing = { id: 1, status: 'available', category: 'Laptops', employeeId: null };
      mockPrisma.asset.findUnique.mockResolvedValue(existing);
      mockPrisma.asset.update.mockResolvedValue({ ...existing, status: 'under_repair' });

      const result = await service.update(1, { status: 'under_repair', notes: 'Screen broken' });
      expect(result.status).toBe('under_repair');
      expect(mockPrisma.assetHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assetId: 1,
          action: 'STATUS_CHANGED',
          previousStatus: 'available',
          newStatus: 'under_repair',
        }),
      });
    });
  });

  describe('remove', () => {
    it('should transition asset status to retired', async () => {
      const existing = { id: 1, status: 'available', category: 'Laptops', employeeId: null };
      mockPrisma.asset.findUnique.mockResolvedValue(existing);
      mockPrisma.asset.update.mockResolvedValue({ ...existing, status: 'retired' });

      const result = await service.remove(1);
      expect(result.status).toBe('retired');
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({ status: 'retired' }),
        }),
      );
    });
  });
});
