import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetHistoryService } from './asset-history.service';

@ApiTags('Asset History')
@Controller('asset-history')
export class AssetHistoryController {
  constructor(
    private readonly assetHistoryService: AssetHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all asset history logs' })
  @ApiResponse({ status: 200, description: 'Asset history records retrieved successfully' })
  findAll() {
    return this.assetHistoryService.findAll();
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get complete lifecycle history timeline for an asset' })
  @ApiResponse({ status: 200, description: 'Asset-specific lifecycle events returned' })
  findByAsset(@Param('assetId', ParseIntPipe) assetId: number) {
    return this.assetHistoryService.findByAsset(assetId);
  }
}