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
