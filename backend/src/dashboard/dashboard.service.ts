import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics() {
    const [
      totalEmployees,
      totalAssets,
      availableAssets,
      assignedAssets,
      damagedAssets,
      totalCategories,
      categoryGroups,
      recentAssignments,
      recentActivity,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.asset.count(),
      this.prisma.asset.count({
        where: { status: 'available' },
      }),
      this.prisma.asset.count({
        where: { status: 'assigned' },
      }),
      this.prisma.asset.count({
        where: { status: 'damaged' },
      }),
      this.prisma.assetCategory.count(),
      this.prisma.asset.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),
      this.prisma.assetAssignment.findMany({
        take: 5,
        orderBy: {
          assignedAt: 'desc',
        },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetTag: true,
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeNo: true,
            },
          },
        },
      }),
      this.prisma.assetHistory.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetTag: true,
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeNo: true,
            },
          },
        },
      }),
    ]);

    const byCategory = (categoryGroups || []).map((group) => ({
      category: group.category,
      count: group._count.id,
    }));

    return {
      totalEmployees,
      totalAssets,
      availableAssets,
      assignedAssets,
      damagedAssets,
      totalCategories,
      byCategory,
      recentAssignments,
      recentActivity,
    };
  }
}  