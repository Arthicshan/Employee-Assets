import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReturnDto) {
    return this.prisma.$transaction(async (tx) => {
    const assignment = await tx.assetAssignment.findUnique({
      where: {
        id: data.assignmentId,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${data.assignmentId} not found`,
      );
    }

    if (assignment.status !== 'ACTIVE') {
      throw new BadRequestException(
        'This assignment has already been returned',
      );
    }

    const returnedAt = data.returnedAt ? new Date(data.returnedAt) : new Date();
    if (returnedAt < assignment.assignedAt) throw new BadRequestException('Return date cannot precede assignment date');
    const asset = await tx.asset.findUnique({where: {id: assignment.assetId}});
    const nextStatus = asset?.status === 'lost' ? 'lost' : data.condition === 'DAMAGED' ? 'damaged' : 'available';
      // 1. Mark assignment as returned
      const updatedAssignment = await tx.assetAssignment.update({
        where: {
          id: data.assignmentId,
        },
        data: {
          status: 'RETURNED',
          returnedAt,
          returnCondition: data.condition,
          returnNotes: data.notes,
        },
      });

      // 2. Make the asset available again
      await tx.asset.update({
        where: {
          id: assignment.assetId,
        },
        data: {
          status: nextStatus,
          condition: data.condition,
          employeeId: null,
        },
      });

      // 3. Record RETURNED event in asset history
      await tx.assetHistory.create({
        data: {
          assetId: assignment.assetId,
          employeeId: assignment.employeeId,
          action: 'RETURNED',
          previousStatus: asset?.status || 'assigned',
          newStatus: nextStatus,
          notes: data.notes,
        },
      });

      return updatedAssignment;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}