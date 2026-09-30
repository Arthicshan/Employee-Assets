import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReturnDto) {
    const assignment = await this.prisma.assetAssignment.findUnique({
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

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark assignment as returned
      const updatedAssignment = await tx.assetAssignment.update({
        where: {
          id: data.assignmentId,
        },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          notes: data.notes ?? assignment.notes,
        },
      });

      // 2. Make the asset available again
      await tx.asset.update({
        where: {
          id: assignment.assetId,
        },
        data: {
          status:
            data.condition.toUpperCase() === 'DAMAGED'
              ? 'damaged'
              : 'available',
          employeeId: null,
        },
      });

      // 3. Record RETURNED event in asset history
      await tx.assetHistory.create({
        data: {
          assetId: assignment.assetId,
          employeeId: assignment.employeeId,
          action: 'RETURNED',
          notes: data.notes,
        },
      });

      return updatedAssignment;
    });
  }
}