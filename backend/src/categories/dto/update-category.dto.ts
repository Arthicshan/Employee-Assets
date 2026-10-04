import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Laptops & Workstations', description: 'Updated category name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated category description', description: 'Updated category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Active status of the category' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  active?: boolean;
}
