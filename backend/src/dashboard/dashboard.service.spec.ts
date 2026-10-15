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
      groupBy: jest.fn().mockResolvedValue([
        { category: 'Laptops', _count: { id: 10 } },
      ]),
    },
    assetCategory: {
      count: jest.fn().mockResolvedValue(6),
    },
    assetAssignment: {
      findMany: jest.fn().mockResolvedValue([]),
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

  it('should calculate and return dashboard statistics with formatted categories and statuses', async () => {
    mockPrisma.employee.count.mockResolvedValue(12);
    mockPrisma.assetCategory.count.mockResolvedValue(4);
    mockPrisma.asset.count
      .mockResolvedValueOnce(50) // total
      .mockResolvedValueOnce(20) // available
      .mockResolvedValueOnce(25) // assigned
      .mockResolvedValueOnce(5);  // damaged

    mockPrisma.asset.groupBy
      .mockResolvedValueOnce([
        { category: 'Hardware', _count: { _all: 30 } },
        { category: 'Peripherals', _count: { _all: 20 } },
      ])
      .mockResolvedValueOnce([
        { status: 'available', _count: { _all: 20 } },
        { status: 'assigned', _count: { _all: 25 } },
        { status: 'damaged', _count: { _all: 5 } },
      ]);

    const result = await service.getStatistics();
    expect(result.totalEmployees).toBe(12);
    expect(result.totalAssets).toBe(50);
    expect(result.availableAssets).toBe(20);
    expect(result.assignedAssets).toBe(25);
    expect(result.damagedAssets).toBe(5);
    expect(result.totalCategories).toBe(4);

    expect(result.byCategory).toEqual([
      { category: 'Hardware', count: 30 },
      { category: 'Peripherals', count: 20 },
    ]);

    // All 6 statuses must be present, with non-matching ones defaulting to 0
    expect(result.byStatus).toEqual([
      { status: 'available', count: 20 },
      { status: 'assigned', count: 25 },
      { status: 'damaged', count: 5 },
      { status: 'under_repair', count: 0 },
      { status: 'lost', count: 0 },
      { status: 'retired', count: 0 },
    ]);
  });

  it('should handle zero records gracefully and zero-fill all status counts', async () => {
    mockPrisma.employee.count.mockResolvedValue(0);
    mockPrisma.assetCategory.count.mockResolvedValue(0);
    mockPrisma.asset.count.mockResolvedValue(0);
    mockPrisma.asset.groupBy.mockResolvedValue([]);
    mockPrisma.assetAssignment.findMany.mockResolvedValue([]);
    mockPrisma.assetHistory.findMany.mockResolvedValue([]);

    const result = await service.getStatistics();
    expect(result.totalEmployees).toBe(0);
    expect(result.totalAssets).toBe(0);
    expect(result.byCategory).toEqual([]);
    expect(result.byStatus.every((s) => s.count === 0)).toBe(true);
    expect(result.recentAssignments).toEqual([]);
    expect(result.recentActivity).toEqual([]);
  });
});