import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListQueryDto {
  @ApiPropertyOptional({ example: 1, description: '1-indexed page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Number of items per page (1-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'Dell', description: 'Search query across relevant fields' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'available', description: 'Filter records by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Laptops', description: 'Filter records by category name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Engineering', description: 'Filter records by department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], description: 'Filter users by role' })
  @IsOptional()
  @IsIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
  role?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by employee ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by asset ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assetId?: number;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort property name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc', description: 'Sort direction' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
