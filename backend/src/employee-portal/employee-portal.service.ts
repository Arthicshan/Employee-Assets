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

    // Fallback: match by User.email
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

    const matchedEmp = await this.prisma.employee.findUnique({
      where: { email: user.email },
    });

    if (!matchedEmp) {
      throw new NotFoundException('No employee record associated with this account');
    }

    return matchedEmp;
  }

  async getProfile(userId: number, employeeId?: number) {
    const employee = await this.resolveEmployee(userId, employeeId);
    return employee;
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
    const employee = await this.resolveEmployee(userId, employeeId);

    const [assignedAssets, totalAssignments, recentAssignments, assignments, history] = await Promise.all([
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
      this.prisma.assetAssignment.findMany({where: {employeeId: employee.id}, include: {asset: true}, orderBy: {assignedAt: 'desc'}}),
      this.prisma.assetHistory.findMany({where: {employeeId: employee.id}, include: {asset: true}, orderBy: {createdAt: 'desc'}}),
    ]);

    return {
      employee: {
        id: employee.id,
        employeeNo: employee.employeeNo,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        position: employee.position,
      },
      summary: {
        assignedAssetsCount: assignedAssets.length,
        totalAssignmentsCount: totalAssignments,
      },
      assignedAssets,
      recentAssignments, assignments, history,
    };
  }
}
