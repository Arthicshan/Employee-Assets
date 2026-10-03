import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should report ok and connected when db query succeeds', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);

    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
  });

  it('should report degraded and disconnected when db query fails', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('disconnected');
  });
});
