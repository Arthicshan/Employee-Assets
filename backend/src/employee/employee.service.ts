import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { assets: true, assignments: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        assets: true,
        assignments: {
          include: { asset: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async create(data: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: number, data: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}