import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany();
  }

  async create(data: CreateEmployeeDto) {
  return this.prisma.employee.create({
    data,
  });
}
  async findOne(id: number) {
  return this.prisma.employee.findUnique({
    where: { id },
  });
}

async update(id: number, data: CreateEmployeeDto) {
  return this.prisma.employee.update({
    where: { id },
    data,
  });
}

async remove(id: number) {
  return this.prisma.employee.delete({
    where: { id },
  });
}
}