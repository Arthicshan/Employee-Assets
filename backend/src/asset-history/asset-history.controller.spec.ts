import { Test, TestingModule } from '@nestjs/testing';
import { AssetHistoryController } from './asset-history.controller';

describe('AssetHistoryController', () => {
  let controller: AssetHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetHistoryController],
    }).compile();

    controller = module.get<AssetHistoryController>(AssetHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
