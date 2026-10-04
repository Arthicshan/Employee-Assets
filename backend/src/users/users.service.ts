import { ListQueryDto } from '../common/dto/list-query.dto';
import { listOptions, listResponse } from '../common/list-query';
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryDto = {}) {
    const searchWhere = query.search ? { OR: ["email", "firstName", "lastName", "position", "role"].map(field => ({[field]: {contains: query.search, mode: 'insensitive' as const}})) } : {};
    const status = query.status?.toUpperCase();
    if (status && !['ACTIVE','INACTIVE'].includes(status)) throw new BadRequestException('Status must be ACTIVE or INACTIVE');
    const where = {...searchWhere, ...(status && {isActive: status === 'ACTIVE'}), ...(query.role && {role: query.role})};
    const data = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      ...listOptions(query, ["id", "createdAt", "email", "firstName", "lastName", "position", "role"]),
    });
    return listResponse(data, query.page || query.limit ? await this.prisma.user.count({where}) : data.length, query);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const defaultPassword = dto.password || 'User123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        position: dto.position?.trim() || (dto.role === 'ADMIN' ? 'System Administrator' : dto.role === 'MANAGER' ? 'Asset Manager' : 'Employee'),
        role: dto.role || 'EMPLOYEE',
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto, currentUserId?: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent changing own role or deactivating own account
    if (currentUserId && id === currentUserId) {
      if (dto.role && dto.role !== existingUser.role) {
        throw new BadRequestException('You cannot change your own role');
      }
      if (dto.isActive === false) {
        throw new BadRequestException('You cannot deactivate your own account');
      }
    }

    if (existingUser.email === 'admin@assetflow.com' && dto.role && dto.role !== 'ADMIN') {
      throw new BadRequestException('The primary system administrator role cannot be demoted');
    }

    if (dto.email && dto.email.toLowerCase().trim() !== existingUser.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          email: dto.email.toLowerCase().trim(),
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Email ${dto.email} is already in use by another account`);
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // Resolve linked employee if exists
    let linkedEmployee = existingUser.employee;
    if (!linkedEmployee && existingUser.employeeId) {
      linkedEmployee = await this.prisma.employee.findUnique({
        where: { id: existingUser.employeeId },
      });
    }
    if (!linkedEmployee) {
      linkedEmployee = await this.prisma.employee.findUnique({
        where: { email: existingUser.email },
      });
    }

    let linkedEmployeeId = existingUser.employeeId ?? linkedEmployee?.id;

    // Synchronize linked employee record if present
    if (linkedEmployee) {
      const targetEmail = dto.email ? dto.email.toLowerCase().trim() : undefined;
      let canUpdateEmployeeEmail = true;

      if (targetEmail && targetEmail !== linkedEmployee.email) {
        const emailOccupied = await this.prisma.employee.findUnique({
          where: { email: targetEmail },
        });
        if (emailOccupied && emailOccupied.id !== linkedEmployee.id) {
          canUpdateEmployeeEmail = false;
        }
      }

      await this.prisma.employee.update({
        where: { id: linkedEmployee.id },
        data: {
          ...(dto.firstName && { firstName: dto.firstName.trim() }),
          ...(dto.lastName && { lastName: dto.lastName.trim() }),
          ...(dto.position !== undefined && { position: dto.position.trim() }),
          ...(canUpdateEmployeeEmail && targetEmail ? { email: targetEmail } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email.toLowerCase().trim() }),
        ...(passwordHash && { passwordHash }),
        ...(dto.firstName && { firstName: dto.firstName.trim() }),
        ...(dto.lastName && { lastName: dto.lastName.trim() }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.role && { role: dto.role }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async toggleStatus(id: number, currentUserId?: number) {
    if (currentUserId && id === currentUserId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    const user = await this.findOne(id);
    if (user.email === 'admin@assetflow.com' && user.isActive) {
      throw new BadRequestException('The primary system administrator cannot be deactivated');
    }
    const newStatus = !user.isActive;

    // Also sync linked employee active status
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });
    const linkedEmployeeId = existingUser?.employeeId ?? existingUser?.employee?.id;
    if (linkedEmployeeId) {
      try {
        await this.prisma.employee.update({
          where: { id: linkedEmployeeId },
          data: { isActive: newStatus },
        });
      } catch {
        // If employee status update fails, proceed
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, currentUserId?: number) {
    if (currentUserId && id === currentUserId) {
      throw new BadRequestException('You cannot delete your own admin account');
    }

    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
