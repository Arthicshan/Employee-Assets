import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { listOptions } from '../common/list-query';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: ListQueryDto = {}) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params?.limit) || 50));
    const skip = (page - 1) * limit;

    const where: Prisma.AssetAssignmentWhereInput = {};
    if (params.status && !["ALL","ACTIVE","RETURNED"].includes(params.status)) throw new BadRequestException("Invalid assignment status");
    if (params.search) where.OR = [{asset: {name: {contains: params.search, mode: "insensitive"}}}, {asset: {assetTag: {contains: params.search, mode: "insensitive"}}}, {employee: {firstName: {contains: params.search, mode: "insensitive"}}}, {employee: {lastName: {contains: params.search, mode: "insensitive"}}}];
    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }
    if (params?.assetId) {
      where.assetId = Number(params.assetId);
    }
    if (params?.employeeId) {
      where.employeeId = Number(params.employeeId);
    }

    const [total, data] = await Promise.all([
      this.prisma.assetAssignment.count({ where }),
      this.prisma.assetAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: listOptions(params, ['id','createdAt','assignedAt','returnedAt','status']).orderBy,
        include: {
          asset: true,
          employee: true,
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: number) {
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id },
      include: {
        asset: true,
        employee: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async create(data: CreateAssignmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findUnique({where: {id: data.employeeId}});
      if (!employee) throw new NotFoundException(`Employee with ID ${data.employeeId} not found`);
      if (!employee.isActive) throw new BadRequestException('Cannot assign equipment to an inactive employee');
      const asset = await tx.asset.findUnique({where: {id: data.assetId}});
      if (!asset) throw new NotFoundException(`Asset with ID ${data.assetId} not found`);
      if (asset.status.toLowerCase() !== 'available') throw new BadRequestException('Only available assets can be assigned');
      const active = await tx.assetAssignment.findFirst({where: {assetId: data.assetId, status: 'ACTIVE'}});
      if (active) throw new BadRequestException('This asset already has an active assignment');
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          notes: data.notes,
          assignedAt: data.assignedAt ? new Date(data.assignedAt) : undefined,
          status: 'ACTIVE',
        },
        include: {
          asset: true,
          employee: true,
        },
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: {
          status: 'assigned',
          employeeId: data.employeeId,
        },
      });

      // Record the assignment in Asset History
      await tx.assetHistory.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          action: 'ASSIGNED',
          previousStatus: asset.status,
          newStatus: 'assigned',
          notes: data.notes,
        },
      });

      return assignment;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}
