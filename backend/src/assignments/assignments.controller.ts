import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Assignments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List asset assignments (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  findAll(@Query() query: ListQueryDto) {
    return this.assignmentsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get assignment details by ID (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Assignment details returned' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.assignmentsService.findOne(Number(id));
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Assign an available asset to an active employee (Admin & Manager)' })
  @ApiResponse({ status: 201, description: 'Asset assigned successfully' })
  @ApiResponse({ status: 400, description: 'Asset unavailable or employee inactive' })
  create(@Body() data: CreateAssignmentDto) {
    return this.assignmentsService.create(data);
  }
}
