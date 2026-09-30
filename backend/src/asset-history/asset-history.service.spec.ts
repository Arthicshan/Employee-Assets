import { Test, TestingModule } from '@nestjs/testing';
import { AssetHistoryService } from './asset-history.service';

describe('AssetHistoryService', () => {
  let service: AssetHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetHistoryService],
    }).compile();

    service = module.get<AssetHistoryService>(AssetHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
