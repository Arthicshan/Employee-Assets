import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: CreateAssignmentDto) {
    return this.assignmentsService.create(data);
  }
}
