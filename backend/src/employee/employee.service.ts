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
          select: {
            assets: { where: { status: 'assigned' } },
            assignments: { where: { status: 'ACTIVE' } },
          },
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
    const employee = await this.findOne(id);
    if (data.isActive === false && employee.isActive !== false) {
      const activeAssignments = await this.prisma.assetAssignment.count({
        where: { employeeId: id, status: 'ACTIVE' },
      });
      const assignedAssets = await this.prisma.asset.count({
        where: { employeeId: id, status: 'assigned' },
      });
      if (activeAssignments > 0 || assignedAssets > 0) {
        throw new BadRequestException('Cannot deactivate employee with active assigned assets. Return all assigned assets first.');
      }
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data,
    });

    if (data.isActive !== undefined) {
      await this.prisma.user.updateMany({
        where: { OR: [{ employeeId: id }, { email: employee.email }] },
        data: { isActive: data.isActive },
      });
    }

    return updated;
  }

  async remove(id: number) {
    const employee = await this.findOne(id);
    const activeAssignments = await this.prisma.assetAssignment.count({
      where: { employeeId: id, status: 'ACTIVE' },
    });
    const assignedAssets = await this.prisma.asset.count({
      where: { employeeId: id, status: 'assigned' },
    });
    if (activeAssignments > 0 || assignedAssets > 0) {
      throw new BadRequestException('Cannot delete employee with active assigned assets. Return all assigned assets first.');
    }

    const pastAssignments = await this.prisma.assetAssignment.count({
      where: { employeeId: id },
    });
    const historyCount = await this.prisma.assetHistory.count({
      where: { employeeId: id },
    });
    if (pastAssignments > 0 || historyCount > 0) {
      await this.prisma.employee.update({
        where: { id },
        data: { isActive: false },
      });
      await this.prisma.user.updateMany({
        where: { OR: [{ employeeId: id }, { email: employee.email }] },
        data: { isActive: false },
      });
      return { id, deactivated: true, message: 'Employee has been deactivated instead of deleted to preserve asset history.' };
    }

    await this.prisma.user.deleteMany({
      where: { OR: [{ employeeId: id }, { email: employee.email }] },
    });

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}