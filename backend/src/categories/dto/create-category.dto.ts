import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptops', description: 'Name of the equipment category' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @ApiPropertyOptional({ example: 'Enterprise notebooks and ultrabooks', description: 'Detailed category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Whether the category is active for equipment assignment' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  active?: boolean;
}
