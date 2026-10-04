import { ParseIntPipe } from '@nestjs/common';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetHistoryService } from './asset-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Asset History')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('asset-history')
export class AssetHistoryController {
  constructor(
    private readonly assetHistoryService: AssetHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all asset history audit logs (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Asset history records retrieved successfully' })
  findAll() {
    return this.assetHistoryService.findAll();
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get lifecycle audit trail for a specific asset (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Asset lifecycle events returned' })
  findByAsset(@Param('assetId', ParseIntPipe) assetId: string) {
    return this.assetHistoryService.findByAsset(Number(assetId));
  }
}