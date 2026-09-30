import { Controller, Get, Param } from '@nestjs/common';
import { AssetHistoryService } from './asset-history.service';

@Controller('asset-history')
export class AssetHistoryController {
  constructor(
    private readonly assetHistoryService: AssetHistoryService,
  ) {}

  @Get()
  findAll() {
    return this.assetHistoryService.findAll();
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.assetHistoryService.findByAsset(Number(assetId));
  }
}