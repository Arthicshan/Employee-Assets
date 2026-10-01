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
    ]);

    return {
      totalEmployees,
      totalAssets,
      availableAssets,
      assignedAssets,
      damagedAssets,
      totalCategories,
    };
  }
}      