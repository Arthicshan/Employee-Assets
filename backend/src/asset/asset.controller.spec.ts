import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AssetHistoryService } from '../asset-history/asset-history.service';

describe('AssetController', () => {
  let controller: AssetController;

  const mockAssetService = {
    findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    findOne: jest.fn(),
    history: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignToEmployee: jest.fn(),
    returnAsset: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        {
          provide: AssetService,
          useValue: mockAssetService,
        },
        {
          provide: AssetHistoryService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findByAsset: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<AssetController>(AssetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call assetService.findAll with query', async () => {
      const mockResponse = [{ id: 1, assetTag: 'LAP-001', name: 'MacBook Pro' }];
      mockAssetService.findAll.mockResolvedValue(mockResponse);

      const query = { search: 'MacBook' };
      const result = await controller.findAll(query);
      expect(result).toEqual(mockResponse);
      expect(mockAssetService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('history', () => {
    it('should return chronological audit history for an asset', async () => {
      const historyRecords = [{ id: 1, assetId: 5, action: 'CREATED' }];
      mockAssetService.history.mockResolvedValue(historyRecords);

      const result = await controller.history(5);
      expect(result).toEqual(historyRecords);
      expect(mockAssetService.history).toHaveBeenCalledWith(5);
    });
  });

  describe('changeStatus', () => {
    it('should update asset lifecycle status and notes', async () => {
      const updated = { id: 5, status: 'under_repair' };
      mockAssetService.update.mockResolvedValue(updated);

      const result = await controller.changeStatus(5, {
        status: 'under_repair',
        notes: 'Keyboard repair',
      });
      expect(result).toEqual(updated);
      expect(mockAssetService.update).toHaveBeenCalledWith(5, {
        status: 'under_repair',
        notes: 'Keyboard repair',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single asset by id', async () => {
      const asset = { id: 5, assetTag: 'LAP-005', name: 'Dell XPS' };
      mockAssetService.findOne.mockResolvedValue(asset);

      const result = await controller.findOne(5);
      expect(result).toEqual(asset);
      expect(mockAssetService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('create', () => {
    it('should register a new asset', async () => {
      const dto = { assetTag: 'LAP-010', name: 'ThinkPad X1', category: 'Laptops' };
      const created = { id: 10, ...dto };
      mockAssetService.create.mockResolvedValue(created);

      const result = await controller.create(dto);
      expect(result).toEqual(created);
      expect(mockAssetService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update and patch', () => {
    it('should update asset specifications via PUT and PATCH', async () => {
      const dto = { name: 'ThinkPad X1 Carbon' };
      const updated = { id: 10, ...dto };
      mockAssetService.update.mockResolvedValue(updated);

      expect(await controller.update(10, dto)).toEqual(updated);
      expect(mockAssetService.update).toHaveBeenCalledWith(10, dto);

      expect(await controller.patch(10, dto)).toEqual(updated);
      expect(mockAssetService.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should retire an asset via assetService.remove', async () => {
      const retired = { id: 10, status: 'retired' };
      mockAssetService.remove.mockResolvedValue(retired);

      const result = await controller.remove(10);
      expect(result).toEqual(retired);
      expect(mockAssetService.remove).toHaveBeenCalledWith(10);
    });
  });
});
