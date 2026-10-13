import { ValidateIf, IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptops', description: 'Name of the equipment category' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'Enterprise notebooks and ultrabooks', description: 'Detailed category description' })
  @IsOptional()
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(250, { message: 'Category description cannot exceed 250 characters' })
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Whether the category is active for equipment assignment' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  active?: boolean;
}
