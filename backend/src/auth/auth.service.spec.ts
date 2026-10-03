import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully authenticate an ADMIN and return accessToken', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@assetflow.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        firstName: 'System',
        lastName: 'Admin',
        isActive: true,
        employeeId: null,
        employee: null,
      });

      const result = await service.login({
        email: 'admin@assetflow.com',
        password: 'admin123',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user).toEqual({
        id: 1,
        email: 'admin@assetflow.com',
        role: 'ADMIN',
        firstName: 'System',
        lastName: 'Admin',
        employeeId: null,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'admin@assetflow.com',
        role: 'ADMIN',
        employeeId: undefined,
      });
    });

    it('should successfully authenticate a MANAGER and return accessToken', async () => {
      const hashedPassword = await bcrypt.hash('manager123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        email: 'manager@assetflow.com',
        passwordHash: hashedPassword,
        role: 'MANAGER',
        firstName: 'Asset',
        lastName: 'Manager',
        isActive: true,
        employeeId: null,
        employee: null,
      });

      const result = await service.login({
        email: 'manager@assetflow.com',
        password: 'manager123',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.role).toBe('MANAGER');
    });

    it('should successfully authenticate an EMPLOYEE and return linked employeeId', async () => {
      const hashedPassword = await bcrypt.hash('employee123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'employee@assetflow.com',
        passwordHash: hashedPassword,
        role: 'EMPLOYEE',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        employeeId: 42,
        employee: { id: 42, employeeNo: 'EMP-000' },
      });

      const result = await service.login({
        email: 'employee@assetflow.com',
        password: 'employee123',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.role).toBe('EMPLOYEE');
      expect(result.user.employeeId).toBe(42);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 3,
        email: 'employee@assetflow.com',
        role: 'EMPLOYEE',
        employeeId: 42,
      });
    });

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@assetflow.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      });

      await expect(
        service.login({
          email: 'admin@assetflow.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@assetflow.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login if account is deactivated', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 3,
        email: 'disabled@assetflow.com',
        passwordHash: 'hash',
        role: 'ADMIN',
        isActive: false,
      });

      await expect(
        service.login({
          email: 'disabled@assetflow.com',
          password: 'password123',
        }),
      ).rejects.toThrow(new UnauthorizedException('Account is deactivated'));
    });
  });
});
