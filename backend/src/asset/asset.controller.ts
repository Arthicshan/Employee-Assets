import { ParseIntPipe } from '@nestjs/common';
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
import { AssetStatusDto } from './dto/asset-status.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
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
  findAll(@Query() query: ListQueryDto) {
    return this.assetService.findAll(query);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.MANAGER)
  history(@Param('id', ParseIntPipe) id: string) { return this.assetService.history(Number(id)); }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  changeStatus(@Param('id', ParseIntPipe) id: string, @Body() data: AssetStatusDto) {
    return this.assetService.update(Number(id), {status: data.status, notes: data.notes});
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get asset details by ID (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Asset details returned' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(@Param('id', ParseIntPipe) id: string) {
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
    @Param('id', ParseIntPipe) id: string,
    @Body() data: UpdateAssetDto,
  ) {
    return this.assetService.update(Number(id), data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  patch(@Param('id', ParseIntPipe) id: string, @Body() data: UpdateAssetDto) {
    return this.assetService.update(Number(id), data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Retire an asset and preserve history (Admin only)' })
  @ApiResponse({ status: 200, description: 'Asset retired successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.assetService.remove(Number(id));
  }

  @Patch(':id/assign/:employeeId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Assign asset directly to an employee (Admin & Manager)' })
  assignToEmployee(
    @Param('id', ParseIntPipe) id: string,
    @Param('employeeId', ParseIntPipe) employeeId: string,
  ) {
    return this.assetService.assignToEmployee(
      Number(id),
      Number(employeeId),
    );
  }

  @Patch(':id/unassign')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Unassign asset from employee (Admin & Manager)' })
  unassignFromEmployee(@Param('id', ParseIntPipe) id: string) {
    return this.assetService.unassignFromEmployee(Number(id));
  }
}