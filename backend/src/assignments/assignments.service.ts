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

  async create(data: CreateAssignmentDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ID ${data.assetId} not found`,
      );
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${data.employeeId} not found`,
      );
    }

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

    if (asset.status.toLowerCase() !== 'available') {
      throw new BadRequestException(
        'Only available assets can be assigned',
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

      return assignment;
    });
  }
}