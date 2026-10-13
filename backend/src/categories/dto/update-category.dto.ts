import { ValidateIf, IsBoolean, IsOptional, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Laptops & Workstations', description: 'Updated category name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'Updated category description', description: 'Updated category description' })
  @IsOptional()
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(250, { message: 'Category description cannot exceed 250 characters' })
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Active status of the category' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  active?: boolean;
}
