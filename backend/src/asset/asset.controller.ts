import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @ApiOperation({ summary: 'List all assets with optional filtering' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by asset status' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category name' })
  @ApiQuery({ name: 'search', required: false, description: 'Search across tags, names, models, brands, serial numbers' })
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
  @ApiOperation({ summary: 'Get asset details and custody history by ID' })
  @ApiResponse({ status: 200, description: 'Asset details returned' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new hardware asset' })
  @ApiResponse({ status: 201, description: 'Asset registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate asset tag / serial number' })
  create(@Body() data: CreateAssetDto) {
    return this.assetService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing asset details' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAssetDto,
  ) {
    return this.assetService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete currently assigned asset' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.remove(id);
  }

  @Patch(':id/assign/:employeeId')
  @ApiOperation({ summary: 'Assign asset directly to an employee' })
  @ApiResponse({ status: 200, description: 'Asset assigned successfully' })
  assignToEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    return this.assetService.assignToEmployee(id, employeeId);
  }

  @Patch(':id/unassign')
  @ApiOperation({ summary: 'Unassign asset from employee' })
  @ApiResponse({ status: 200, description: 'Asset unassigned successfully' })
  unassign(@Param('id', ParseIntPipe) id: number) {
    return this.assetService.unassignFromEmployee(id);
  }
}