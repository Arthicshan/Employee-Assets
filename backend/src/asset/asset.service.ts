import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { ReturnsService } from '../returns/returns.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { listOptions, listResponse } from '../common/list-query';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService, private readonly assignments: AssignmentsService, private readonly returns: ReturnsService) {}

  async findAll(query: ListQueryDto = {}) {
    const status = query.status?.toLowerCase();
    if (status && !['available','assigned','damaged','under_repair','lost','retired'].includes(status)) throw new BadRequestException('Invalid asset status');
    const where: Prisma.AssetWhereInput = {
      ...(status && { status }),
      ...(query.category && { category: { equals: query.category, mode: 'insensitive' } }),
      ...(query.employeeId && { employeeId: query.employeeId }),
      ...(query.search && { OR: ['name','assetTag','brand','model','serialNumber'].map(field => ({ [field]: { contains: query.search, mode: 'insensitive' } })) }),
    };
    const data = await this.prisma.asset.findMany({ where, include: { employee: true }, ...listOptions(query, ['id','createdAt','name','assetTag','status','category','purchaseDate']) });
    return listResponse(data, query.page || query.limit ? await this.prisma.asset.count({where}) : data.length, query);
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id }, include: { employee: true, categoryRecord: true, assignments: { where: { status: 'ACTIVE' }, include: { employee: true } } } });
    if (!asset) throw new NotFoundException(`Asset with ID ${id} not found`);
    return asset;
  }

  private async validateCategory(tx: Prisma.TransactionClient, name: string) {
    const category = await tx.assetCategory.findUnique({where: {name}});
    if (!category || !category.active) throw new BadRequestException('Select an active asset category');
  }

  async create(data: CreateAssetDto) {
    if (data.status === 'assigned') throw new BadRequestException('Use the assignment workflow to assign assets');
    return this.prisma.$transaction(async tx => {
      await this.validateCategory(tx, data.category);
      const asset = await tx.asset.create({data: {
        assetTag: data.assetTag, name: data.name, category: data.category, brand: data.brand, model: data.model, condition: data.condition, notes: data.notes, purchasePrice: data.purchasePrice, status: data.status || 'available', serialNumber: data.serialNumber?.trim() || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiryDate: data.warrantyExpiryDate ? new Date(data.warrantyExpiryDate) : null,
      }});
      await tx.assetHistory.create({data: {assetId: asset.id, action: 'CREATED', newStatus: asset.status, notes: data.notes}});
      return asset;
    });
  }

  async update(id: number, data: UpdateAssetDto) {
    return this.prisma.$transaction(async tx => {
      const asset = await tx.asset.findUnique({where: {id}});
      if (!asset) throw new NotFoundException(`Asset with ID ${id} not found`);
      if (data.category && data.category !== asset.category) await this.validateCategory(tx, data.category);
      const active = await tx.assetAssignment.findFirst({where: {assetId: id, status: 'ACTIVE'}});
      const status = data.status || asset.status;
      if (status === 'assigned' && asset.status !== 'assigned') throw new BadRequestException('Use the assignment workflow to assign assets');
      if (active && status !== asset.status && status !== 'lost') throw new BadRequestException('Return this asset before changing its status');
      if (!active && status === 'assigned') throw new BadRequestException('Assigned assets require an active assignment');
      const updated = await tx.asset.update({where: {id}, data: {
        assetTag: data.assetTag, name: data.name, category: data.category, brand: data.brand, model: data.model, condition: data.condition, notes: data.notes, purchasePrice: data.purchasePrice, status: data.status,
        ...(data.serialNumber !== undefined && {serialNumber: data.serialNumber?.trim() || null}),
        ...(data.purchaseDate !== undefined && {purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null}),
        ...(data.warrantyExpiryDate !== undefined && {warrantyExpiryDate: data.warrantyExpiryDate ? new Date(data.warrantyExpiryDate) : null}),
      }});
      if (status !== asset.status) await tx.assetHistory.create({data: {assetId: id, employeeId: asset.employeeId, action: 'STATUS_CHANGED', previousStatus: asset.status, newStatus: status, notes: data.notes}});
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async remove(id: number) {
    return this.update(id, {status: 'retired'});
  }

  async assignToEmployee(assetId: number, employeeId: number) {
    await this.assignments.create({assetId, employeeId});
    return this.findOne(assetId);
  }

  async unassignFromEmployee(assetId: number) {
    await this.findOne(assetId);
    const assignment = await this.prisma.assetAssignment.findFirst({where: {assetId, status: 'ACTIVE'}});
    if (!assignment) throw new BadRequestException('No active assignment to return');
    await this.returns.create({assignmentId: assignment.id, condition: 'GOOD'});
    return this.findOne(assetId);
  }

  async history(id: number) {
    await this.findOne(id);
    return this.prisma.assetHistory.findMany({where: {assetId: id}, orderBy: [{createdAt:'desc'}, {id:'desc'}], include:{employee:true}});
  }
}
