import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.asset.findMany({
      include: {
        employee: true,
      },
    });
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async create(data: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        status: data.status ?? 'available',
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
      },
    });
  }

  async update(id: number, data: CreateAssetDto) {
    await this.findOne(id);

    return this.prisma.asset.update({
      where: { id },
      data: {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        status: data.status,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.asset.delete({
      where: { id },
    });
  }

  async assignToEmployee(assetId: number, employeeId: number) {
  await this.findOne(assetId);

  const employee = await this.prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new NotFoundException(
      `Employee with ID ${employeeId} not found`,
    );
  }

  return this.prisma.asset.update({
    where: { id: assetId },
    data: {
      employeeId: employeeId,
      status: 'assigned',
    },
    include: {
      employee: true,
    },
  });
}

async unassignFromEmployee(assetId: number) {
  await this.findOne(assetId);

  return this.prisma.asset.update({
    where: { id: assetId },
    data: {
      employeeId: null,
      status: 'available',
    },
    include: {
      employee: true,
    },
  });
}

}