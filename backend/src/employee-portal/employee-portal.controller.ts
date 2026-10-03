import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeePortalService } from './employee-portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Employee Portal')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EMPLOYEE, Role.ADMIN, Role.MANAGER)
@Controller('employee-portal')
export class EmployeePortalController {
  constructor(private readonly portalService: EmployeePortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview for the authenticated employee' })
  @ApiResponse({ status: 200, description: 'Employee dashboard metrics and assigned assets returned' })
  getMyDashboard(@Req() req: any) {
    return this.portalService.getMyDashboard(req.user.id, req.user.employeeId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get profile information for the authenticated employee' })
  @ApiResponse({ status: 200, description: 'Employee profile returned' })
  getMyProfile(@Req() req: any) {
    return this.portalService.getProfile(req.user.id, req.user.employeeId);
  }

  @Get('assets')
  @ApiOperation({ summary: 'Get assets currently assigned to the authenticated employee' })
  @ApiResponse({ status: 200, description: 'List of assigned assets returned' })
  getMyAssets(@Req() req: any) {
    return this.portalService.getMyAssets(req.user.id, req.user.employeeId);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get assignment history records for the authenticated employee' })
  @ApiResponse({ status: 200, description: 'List of employee assignments returned' })
  getMyAssignments(@Req() req: any) {
    return this.portalService.getMyAssignments(req.user.id, req.user.employeeId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get lifecycle event history involving the authenticated employee' })
  @ApiResponse({ status: 200, description: 'List of employee lifecycle history events returned' })
  getMyHistory(@Req() req: any) {
    return this.portalService.getMyHistory(req.user.id, req.user.employeeId);
  }
}
