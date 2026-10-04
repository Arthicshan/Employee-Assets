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
      totalCategories, byCategory, byStatus, recentAssignments, recentActivity,
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
      this.prisma.asset.groupBy({by: ['category'], _count: {_all: true}}),
      this.prisma.asset.groupBy({by: ['status'], _count: {_all: true}}),
      this.prisma.assetAssignment.findMany({take: 5, orderBy: {assignedAt: 'desc'}, include: {asset: true, employee: true}}),
      this.prisma.assetHistory.findMany({take: 10, orderBy: {createdAt: 'desc'}, include: {asset: true, employee: true}}),
    ]);

    return {
      totalEmployees,
      totalAssets,
      availableAssets,
      assignedAssets,
      damagedAssets,
      totalCategories,
      byCategory: byCategory.map(row => ({category: row.category, count: row._count._all})),
      byStatus: ['available','assigned','damaged','under_repair','lost','retired'].map(status => ({status, count: byStatus.find(row => row.status === status)?._count._all || 0})),
      recentAssignments, recentActivity,
    };
  }
}  