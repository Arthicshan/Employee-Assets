import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssetService } from './asset.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssetService', () => {
  let service: AssetService;

  const mockPrisma = {
    asset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
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
});
