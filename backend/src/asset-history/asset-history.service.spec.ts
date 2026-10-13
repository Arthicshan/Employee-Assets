import { Test, TestingModule } from '@nestjs/testing';
import { AssetHistoryService } from './asset-history.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssetHistoryService', () => {
  let service: AssetHistoryService;

  const mockPrisma = {
    assetHistory: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetHistoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AssetHistoryService>(AssetHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new asset history audit entry', async () => {
    const newEntry = {
      id: 3,
      assetId: 10,
      employeeId: 5,
      action: 'ASSIGNED',
      notes: 'Issued for remote work',
    };
    mockPrisma.assetHistory.create.mockResolvedValue(newEntry);

    const result = await service.create({
      assetId: 10,
      employeeId: 5,
      action: 'ASSIGNED',
      notes: 'Issued for remote work',
    });

    expect(mockPrisma.assetHistory.create).toHaveBeenCalledWith({
      data: {
        assetId: 10,
        employeeId: 5,
        action: 'ASSIGNED',
        notes: 'Issued for remote work',
      },
    });
    expect(result).toEqual(newEntry);
  });

  it('should fetch all asset history records ordered by creation date', async () => {
    const allLogs = [
      { id: 1, assetId: 10, action: 'ASSIGNED' },
      { id: 2, assetId: 12, action: 'RETURNED' },
    ];
    mockPrisma.assetHistory.findMany.mockResolvedValue(allLogs);

    const result = await service.findAll();
    expect(mockPrisma.assetHistory.findMany).toHaveBeenCalledWith({
      include: { asset: true, employee: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual(allLogs);
  });

  it('should fetch history for specific asset', async () => {
    const historyLogs = [
      { id: 1, assetId: 10, action: 'ASSIGNED', notes: 'Initial issue' },
      { id: 2, assetId: 10, action: 'RETURNED', notes: 'Quarterly refresh' },
    ];
    mockPrisma.assetHistory.findMany.mockResolvedValue(historyLogs);

    const result = await service.findByAsset(10);
    expect(mockPrisma.assetHistory.findMany).toHaveBeenCalledWith({
      where: { assetId: 10 },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual(historyLogs);
  });
});
