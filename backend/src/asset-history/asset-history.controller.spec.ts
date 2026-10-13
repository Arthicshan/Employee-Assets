import { Test, TestingModule } from '@nestjs/testing';
import { AssetHistoryController } from './asset-history.controller';
import { AssetHistoryService } from './asset-history.service';

describe('AssetHistoryController', () => {
  let controller: AssetHistoryController;

  const mockAssetHistoryService = {
    findAll: jest.fn(),
    findByAsset: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetHistoryController],
      providers: [
        {
          provide: AssetHistoryService,
          useValue: mockAssetHistoryService,
        },
      ],
    }).compile();

    controller = module.get<AssetHistoryController>(AssetHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all asset history audit logs', async () => {
      const mockHistory = [
        { id: 1, assetId: 10, action: 'ASSIGNED' },
        { id: 2, assetId: 12, action: 'RETURNED' },
      ];
      mockAssetHistoryService.findAll.mockResolvedValue(mockHistory);

      const result = await controller.findAll();
      expect(result).toEqual(mockHistory);
      expect(mockAssetHistoryService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByAsset', () => {
    it('should return audit history for a specific asset', async () => {
      const mockAssetHistory = [{ id: 1, assetId: 10, action: 'ASSIGNED' }];
      mockAssetHistoryService.findByAsset.mockResolvedValue(mockAssetHistory);

      const result = await controller.findByAsset('10');
      expect(result).toEqual(mockAssetHistory);
      expect(mockAssetHistoryService.findByAsset).toHaveBeenCalledWith(10);
    });
  });
});
