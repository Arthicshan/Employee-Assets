import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    status?: string;
    assetId?: number;
    employeeId?: number;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params?.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
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
        orderBy: { createdAt: 'desc' },
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
    // 1. Check employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${data.employeeId} not found`,
      );
    }

    // 2. Check employee is active
    if (!employee.isActive) {
      throw new BadRequestException(
        `Cannot assign asset to inactive employee "${employee.firstName} ${employee.lastName}". Only active employees can receive equipment.`,
      );
    }

    // 3. Check asset exists
    const asset = await this.prisma.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ID ${data.assetId} not found`,
      );
    }

    // 4. Check asset status is AVAILABLE
    if (asset.status.toLowerCase() !== 'available') {
      throw new BadRequestException(
        `Only available assets can be assigned. Current asset status is "${asset.status}".`,
      );
    }

    // 5. Prevent multiple active assignments for the same asset
    const activeAssignment =
      await this.prisma.assetAssignment.findFirst({
        where: {
          assetId: data.assetId,
          status: 'ACTIVE',
        },
      });

    if (activeAssignment) {
      throw new BadRequestException(
        'This asset already has an active assignment',
      );
    }

    return this.prisma.$transaction(async (tx) => {

      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          notes: data.notes,
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
          notes: data.notes,
        },
      });

      return assignment;
    });
  }
}
