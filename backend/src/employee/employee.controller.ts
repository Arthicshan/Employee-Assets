import { Query, ParseIntPipe as IdPipe } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List all employee records (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  findAll(@Query() query: ListQueryDto) {
    return this.employeeService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get employee details by ID (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Employee details returned' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id', IdPipe) id: string) {
    return this.employeeService.findOne(Number(id));
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new employee record (Admin only)' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  create(@Body() data: CreateEmployeeDto) {
    return this.employeeService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update employee record (Admin only)' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  update(@Param('id', IdPipe) id: string, @Body() data: UpdateEmployeeDto) {
    return this.employeeService.update(Number(id), data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Partially update employee record (Admin only)' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  patch(@Param('id', IdPipe) id: string, @Body() data: UpdateEmployeeDto) {
    return this.employeeService.update(Number(id), data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an employee record (Admin only)' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  remove(@Param('id', IdPipe) id: string) {
    return this.employeeService.remove(Number(id));
  }
}