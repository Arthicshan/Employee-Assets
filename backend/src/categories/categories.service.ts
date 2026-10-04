import { BadRequestException } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { listOptions, listResponse } from '../common/list-query';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListQueryDto = {}) {
    const searchWhere = query.search ? { OR: ["name", "description"].map(field => ({[field]: {contains: query.search, mode: 'insensitive' as const}})) } : {};
    const status = query.status?.toUpperCase();
    if (status && !['ACTIVE','INACTIVE'].includes(status)) throw new BadRequestException('Status must be ACTIVE or INACTIVE');
    const where = {...searchWhere, ...(status && {active: status === 'ACTIVE'})};
    const data = await this.prisma.assetCategory.findMany({
      where,
      ...listOptions(query, ["id", "createdAt", "name", "description"]),
    });
    return listResponse(data, query.page || query.limit ? await this.prisma.assetCategory.count({where}) : data.length, query);
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