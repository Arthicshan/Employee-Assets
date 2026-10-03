import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    employee: {
      count: jest.fn().mockResolvedValue(10),
    },
    asset: {
      count: jest.fn().mockResolvedValue(50),
    },
    assetCategory: {
      count: jest.fn().mockResolvedValue(6),
    },
    assetHistory: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate and return dashboard statistics', async () => {
    mockPrisma.asset.count
      .mockResolvedValueOnce(50) // total
      .mockResolvedValueOnce(20) // available
      .mockResolvedValueOnce(25) // assigned
      .mockResolvedValueOnce(3)  // damaged
      .mockResolvedValueOnce(2); // under repair

    const result = await service.getStatistics();
    expect(result).toHaveProperty('totalAssets');
    expect(result).toHaveProperty('totalEmployees');
    expect(mockPrisma.employee.count).toHaveBeenCalled();
  });
});