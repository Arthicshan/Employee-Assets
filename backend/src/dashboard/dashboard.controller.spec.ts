import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockDashboardService = {
    getStatistics: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatistics', () => {
    it('should return dashboard KPI metrics and summaries', async () => {
      const mockStats = {
        totalAssets: 50,
        availableAssets: 20,
        assignedAssets: 25,
        damagedAssets: 3,
        underRepairAssets: 2,
        totalEmployees: 15,
        totalCategories: 6,
      };
      mockDashboardService.getStatistics.mockResolvedValue(mockStats);

      const result = await controller.getStatistics();
      expect(result).toEqual(mockStats);
      expect(mockDashboardService.getStatistics).toHaveBeenCalledTimes(1);
    });
  });
});
