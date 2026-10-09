import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        { id: 1, email: 'admin@company.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', isActive: true },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll({});
      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status filter', async () => {
      await expect(service.findAll({ status: 'INVALID' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const user = { id: 1, email: 'user@test.com', firstName: 'Test', lastName: 'User' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'existing@company.com' });

      await expect(
        service.create({
          email: 'existing@company.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully create a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 2,
        email: 'new@company.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        isActive: true,
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create({
        email: 'new@company.com',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(result).toEqual(createdUser);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('toggleStatus', () => {
    it('should reject deactivating an admin user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        role: 'ADMIN',
        isActive: true,
      });

      await expect(service.toggleStatus(1)).rejects.toThrow(BadRequestException);
    });

    it('should toggle status of regular user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        role: 'EMPLOYEE',
        isActive: true,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 2,
        role: 'EMPLOYEE',
        isActive: false,
      });

      const result = await service.toggleStatus(2);
      expect(result.isActive).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { isActive: false },
        select: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should prevent deleting own logged-in admin account', async () => {
      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should prevent deleting any admin account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        role: 'ADMIN',
      });

      await expect(service.remove(2, 1)).rejects.toThrow(BadRequestException);
    });

    it('should delete non-admin user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 3,
        role: 'EMPLOYEE',
      });
      mockPrisma.user.delete.mockResolvedValue({ id: 3 });

      const result = await service.remove(3, 1);
      expect(result).toEqual({ id: 3, deleted: true });
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    });
  });
});
