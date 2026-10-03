import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeePortalService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: number, employeeId?: number) {
    if (employeeId) {
      const emp = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });
      if (emp) return emp;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    if (user.employee) {
      return user.employee;
    }

    if (user.employeeId) {
      const empById = await this.prisma.employee.findUnique({
        where: { id: user.employeeId },
      });
      if (empById) return empById;
    }

    const matchedEmp = await this.prisma.employee.findUnique({
      where: { email: user.email },
    });

    if (matchedEmp) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { employeeId: matchedEmp.id },
      });
      return matchedEmp;
    }

    throw new NotFoundException('No employee record associated with this account');
  }

  async getProfile(userId: number, employeeId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const employee = await this.resolveEmployee(userId, employeeId);
    return {
      ...employee,
      firstName: user?.firstName || employee.firstName,
      lastName: user?.lastName || employee.lastName,
      position: user?.position || employee.position,
      email: user?.email || employee.email,
    };
  }

  async getMyAssets(userId: number, employeeId?: number) {
    const employee = await this.resolveEmployee(userId, employeeId);
    return this.prisma.asset.findMany({
      where: {
        employeeId: employee.id,
        status: 'assigned',
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMyAssignments(userId: number, employeeId?: number) {
    const employee = await this.resolveEmployee(userId, employeeId);
    return this.prisma.assetAssignment.findMany({
      where: {
        employeeId: employee.id,
      },
      include: {
        asset: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getMyHistory(userId: number, employeeId?: number) {
    const employee = await this.resolveEmployee(userId, employeeId);
    return this.prisma.assetHistory.findMany({
      where: {
        employeeId: employee.id,
      },
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyDashboard(userId: number, employeeId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const employee = await this.resolveEmployee(userId, employeeId);

    const [assignedAssets, totalAssignments, recentAssignments] = await Promise.all([
      this.prisma.asset.findMany({
        where: {
          employeeId: employee.id,
          status: 'assigned',
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.assetAssignment.count({
        where: {
          employeeId: employee.id,
        },
      }),
      this.prisma.assetAssignment.findMany({
        where: {
          employeeId: employee.id,
        },
        include: {
          asset: true,
        },
        orderBy: { assignedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      employee: {
        id: employee.id,
        employeeNo: employee.employeeNo,
        firstName: user?.firstName || employee.firstName,
        lastName: user?.lastName || employee.lastName,
        email: user?.email || employee.email,
        department: employee.department,
        position: user?.position || employee.position,
      },
      summary: {
        assignedAssetsCount: assignedAssets.length,
        totalAssignmentsCount: totalAssignments,
      },
      assignedAssets,
      recentAssignments,
    };
  }
}
