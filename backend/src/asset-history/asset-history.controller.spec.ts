import { Test, TestingModule } from '@nestjs/testing';
import { AssetHistoryController } from './asset-history.controller';
import { AssetHistoryService } from './asset-history.service';

describe('AssetHistoryController', () => {
  let controller: AssetHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetHistoryController],
      providers: [
        {
          provide: AssetHistoryService,
          useValue: {
            findByAssetId: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<AssetHistoryController>(AssetHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

