import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List equipment assignments with pagination and status filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (ACTIVE, RETURNED, ALL)' })
  @ApiQuery({ name: 'assetId', required: false, description: 'Filter by asset ID' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Assignments list retrieved successfully' })
  findAll(
    @Query('status') status?: string,
    @Query('assetId') assetId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.assignmentsService.findAll({
      status,
      assetId: assetId ? Number(assetId) : undefined,
      employeeId: employeeId ? Number(employeeId) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment record details by ID' })
  @ApiResponse({ status: 200, description: 'Assignment details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Assign an AVAILABLE asset to an ACTIVE employee' })
  @ApiResponse({ status: 201, description: 'Asset successfully assigned within a transaction' })
  @ApiResponse({ status: 400, description: 'Business rule violation (asset not available, employee inactive, or already assigned)' })
  @ApiResponse({ status: 404, description: 'Asset or employee not found' })
  create(@Body() data: CreateAssignmentDto) {
    return this.assignmentsService.create(data);
  }
}
