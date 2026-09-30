import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    assetId: number;
    employeeId?: number;
    action: string;
    notes?: string;
  }) {
    return this.prisma.assetHistory.create({
      data: {
        assetId: data.assetId,
        employeeId: data.employeeId,
        action: data.action,
        notes: data.notes,
      },
    });
  }

  async findAll() {
    return this.prisma.assetHistory.findMany({
      include: {
        asset: true,
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByAsset(assetId: number) {
    return this.prisma.assetHistory.findMany({
      where: {
        assetId,
      },
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}