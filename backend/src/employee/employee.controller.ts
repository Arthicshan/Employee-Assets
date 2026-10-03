import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'List all employees with asset count summaries' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  findAll() {
    return this.employeeService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Register a new employee' })
  @ApiResponse({ status: 201, description: 'Employee registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate employeeNo / email' })
  create(@Body() data: CreateEmployeeDto) {
    return this.employeeService.create(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee details and currently assigned equipment' })
  @ApiResponse({ status: 200, description: 'Employee details returned' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee profile and active employment status' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateEmployeeDto) {
    return this.employeeService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.remove(id);
  }
}