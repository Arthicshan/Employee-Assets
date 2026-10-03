import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Laptops & Workstations', description: 'Updated category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated category description', description: 'Updated category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Active status of the category' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
