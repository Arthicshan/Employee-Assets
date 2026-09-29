import { Body, Controller, Post } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Post()
  create(@Body() data: CreateAssignmentDto) {
    return this.assignmentsService.create(data);
  }
} 