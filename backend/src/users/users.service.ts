import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
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
      orderBy: { id: 'asc' },
    });
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

    // Look for matching employee by email
    let matchingEmployee = await this.prisma.employee.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // If role is EMPLOYEE and no employee exists, auto-create one for employee directory & portal
    if (!matchingEmployee && (dto.role === 'EMPLOYEE' || !dto.role)) {
      const count = await this.prisma.employee.count();
      const employeeNo = `EMP-${String(count + 1).padStart(3, '0')}`;
      try {
        matchingEmployee = await this.prisma.employee.create({
          data: {
            employeeNo,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            email: dto.email.toLowerCase().trim(),
            department: 'General',
            position: dto.position?.trim() || 'Employee',
            isActive: dto.isActive !== undefined ? dto.isActive : true,
          },
        });
      } catch {
        // If employee creation fails (e.g. employeeNo collision), continue without blocker
      }
    }

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        position: dto.position?.trim() || (dto.role === 'ADMIN' ? 'System Administrator' : dto.role === 'MANAGER' ? 'Asset Manager' : 'Employee'),
        role: dto.role || 'EMPLOYEE',
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        ...(matchingEmployee ? { employeeId: matchingEmployee.id } : {}),
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

  async update(id: number, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
        ...(dto.position !== undefined && { position: dto.position.trim() }),
        ...(dto.role && { role: dto.role }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(linkedEmployeeId && !existingUser.employeeId ? { employeeId: linkedEmployeeId } : {}),
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

  async toggleStatus(id: number) {
    const user = await this.findOne(id);
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

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
