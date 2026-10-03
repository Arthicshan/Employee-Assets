import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Assets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List all assets with optional filtering (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.assetService.findAll({
      status,
      category,
      search,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get asset details by ID (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Asset details returned' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(Number(id));
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Register a new asset (Admin only)' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  create(@Body() data: CreateAssetDto) {
    return this.assetService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update asset specifications (Admin only)' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  update(
    @Param('id') id: string,
    @Body() data: UpdateAssetDto,
  ) {
    return this.assetService.update(Number(id), data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an asset (Admin only)' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  remove(@Param('id') id: string) {
    return this.assetService.remove(Number(id));
  }

  @Patch(':id/assign/:employeeId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Assign asset directly to an employee (Admin & Manager)' })
  assignToEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.assetService.assignToEmployee(
      Number(id),
      Number(employeeId),
    );
  }

  @Patch(':id/unassign')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Unassign asset from employee (Admin & Manager)' })
  unassignFromEmployee(@Param('id') id: string) {
    return this.assetService.unassignFromEmployee(Number(id));
  }
}