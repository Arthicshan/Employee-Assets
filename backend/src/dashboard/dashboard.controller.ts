import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get KPI statistics, status distribution, and recent activity' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics and summaries retrieved successfully' })
  getStatistics() {
    return this.dashboardService.getStatistics();
  }
}
