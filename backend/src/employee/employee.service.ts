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
    const currentEmp = await this.findOne(id);
    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data,
    });

    // Keep linked User account in sync
    const linkedUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: id },
          { email: currentEmp.email },
        ],
      },
    });

    if (linkedUser) {
      await this.prisma.user.update({
        where: { id: linkedUser.id },
        data: {
          ...(data.firstName && { firstName: data.firstName.trim() }),
          ...(data.lastName && { lastName: data.lastName.trim() }),
          ...(data.position !== undefined && { position: data.position.trim() }),
          ...(data.email && { email: data.email.toLowerCase().trim() }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          employeeId: id,
        },
      });
    }

    return updatedEmployee;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}