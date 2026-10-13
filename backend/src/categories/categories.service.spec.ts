import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrisma = {
    assetCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    asset: {
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories when no pagination is provided', async () => {
      const categories = [
        { id: 1, name: 'Laptops', description: 'Portable computers', active: true },
      ];
      mockPrisma.assetCategory.findMany.mockResolvedValue(categories);

      const result = await service.findAll({});
      expect(result).toEqual(categories);
      expect(mockPrisma.assetCategory.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status filter', async () => {
      await expect(service.findAll({ status: 'UNKNOWN' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = { id: 1, name: 'Monitors', active: true };
      mockPrisma.assetCategory.findUnique.mockResolvedValue(category);

      const result = await service.findOne(1);
      expect(result).toEqual(category);
      expect(mockPrisma.assetCategory.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrisma.assetCategory.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should trim inputs and create a new category', async () => {
      const created = { id: 2, name: 'Accessories', description: 'Mice and keyboards', active: true };
      mockPrisma.assetCategory.create.mockResolvedValue(created);

      const result = await service.create({
        name: '  Accessories  ',
        description: '  Mice and keyboards  ',
      });

      expect(result).toEqual(created);
      expect(mockPrisma.assetCategory.create).toHaveBeenCalledWith({
        data: {
          name: 'Accessories',
          description: 'Mice and keyboards',
          active: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      mockPrisma.assetCategory.findUnique.mockResolvedValue({ id: 1, name: 'Laptops' });
      const updated = { id: 1, name: 'Workstations', active: false };
      mockPrisma.assetCategory.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: ' Workstations ', active: false });
      expect(result).toEqual(updated);
      expect(mockPrisma.assetCategory.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Workstations', active: false },
      });
    });
  });

  describe('remove', () => {
    it('should delete an existing category', async () => {
      mockPrisma.assetCategory.findUnique.mockResolvedValue({ id: 1, name: 'Laptops' });
      mockPrisma.assetCategory.delete.mockResolvedValue({ id: 1, name: 'Laptops' });

      const result = await service.remove(1);
      expect(result).toEqual({ id: 1, name: 'Laptops' });
      expect(mockPrisma.assetCategory.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
