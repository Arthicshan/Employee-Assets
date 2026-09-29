import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Post()
  create(@Body() data: CreateEmployeeDto) {
    return this.employeeService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: CreateEmployeeDto) {
    return this.employeeService.update(Number(id), data);
  }

  @Delete(':id')
remove(@Param('id') id: string) {
  return this.employeeService.remove(Number(id));
}
}