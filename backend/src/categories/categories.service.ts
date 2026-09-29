import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.assetCategory.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${id} not found`,
      );
    }

    return category;
  }

  async create(data: {
    name: string;
    description?: string;
    active?: boolean;
  }) {
    return this.prisma.assetCategory.create({
      data: {
        name: data.name,
        description: data.description,
        active: data.active ?? true,
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      active?: boolean;
    },
  ) {
    await this.findOne(id);

    return this.prisma.assetCategory.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.assetCategory.delete({
      where: { id },
    });
  }
}