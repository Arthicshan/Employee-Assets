import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';


@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: {
  status?: string;
  category?: string;
  search?: string;
} = {}) {
  const { status, category, search } = filters;

  return this.prisma.asset.findMany({
    where: {
      ...(status && {
        status: status,
      }),

      ...(category && {
        category: {
          contains: category,
          mode: 'insensitive',
        },
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            assetTag: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            brand: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    },

    include: {
      employee: true,
    },

    orderBy: {
      createdAt: 'desc',
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
        purchasePrice: data.purchasePrice != null ? Number(data.purchasePrice) : undefined,
        warrantyExpiryDate: data.warrantyExpiryDate
          ? new Date(data.warrantyExpiryDate)
          : undefined,
      },
    });
  }

  async update(id: number, data: UpdateAssetDto) {
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
        purchaseDate: data.purchaseDate !== undefined
          ? (data.purchaseDate ? new Date(data.purchaseDate) : null)
          : undefined,
        purchasePrice: data.purchasePrice !== undefined
          ? (data.purchasePrice != null && (data.purchasePrice as any) !== '' ? Number(data.purchasePrice) : null)
          : undefined,
        warrantyExpiryDate: data.warrantyExpiryDate !== undefined
          ? (data.warrantyExpiryDate ? new Date(data.warrantyExpiryDate) : null)
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