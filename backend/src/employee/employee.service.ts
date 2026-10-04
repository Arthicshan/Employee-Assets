import { BadRequestException } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { listOptions, listResponse } from '../common/list-query';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryDto = {}) {
    const searchWhere = query.search ? { OR: ["employeeNo", "firstName", "lastName", "email", "department", "position"].map(field => ({[field]: {contains: query.search, mode: 'insensitive' as const}})) } : {};
    const status = query.status?.toUpperCase();
    if (status && !['ACTIVE','INACTIVE'].includes(status)) throw new BadRequestException('Status must be ACTIVE or INACTIVE');
    const where = {...searchWhere, ...(status && {isActive: status === 'ACTIVE'}), ...(query.department && {department: query.department})};
    const data = await this.prisma.employee.findMany({
      where,
      ...listOptions(query, ["id", "createdAt", "employeeNo", "firstName", "lastName", "email", "department", "position"]),
      include: {
        _count: {
          select: { assets: true, assignments: true },
        },
      },
    });
    return listResponse(data, query.page || query.limit ? await this.prisma.employee.count({where}) : data.length, query);
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
        employeeNo: data.employeeNo, firstName: data.firstName, lastName: data.lastName, email: data.email, department: data.department, position: data.position,
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
    const referenced = await this.prisma.assetAssignment.count({where: {employeeId: id}}) + await this.prisma.assetHistory.count({where: {employeeId: id}});
    if (referenced) return this.prisma.employee.update({where: {id}, data: {isActive: false}});
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}