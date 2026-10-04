import { BadRequestException } from '@nestjs/common';
import { ListQueryDto } from './dto/list-query.dto';
export function listOptions(query: ListQueryDto, fields: string[], defaultField = 'createdAt') {
  const sortBy = query.sortBy || defaultField;
  if (!fields.includes(sortBy)) throw new BadRequestException('Unsupported sort field');
  return {
    ...(query.page || query.limit ? { skip: ((query.page || 1) - 1) * (query.limit || 20), take: query.limit || 20 } : {}),
    orderBy: [{ [sortBy]: query.sortOrder || 'desc' }, { id: 'asc' as const }],
  };
}
export function listResponse(data: unknown[], total: number, query: ListQueryDto) {
  if (!query.page && !query.limit) return data;
  const page = query.page || 1, limit = query.limit || 20;
  return { data, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}
