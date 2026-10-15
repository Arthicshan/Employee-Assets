import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'LAP-0012', description: 'Unique asset inventory tag' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Asset tag must be at least 3 characters (e.g. MOB-001)' })
  @MaxLength(30, { message: 'Asset tag cannot exceed 30 characters' })
  @Transform(({value}) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Asset tag must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  assetTag: string;

  @ApiProperty({ example: 'Dell Latitude 5450', description: 'Equipment name/title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Asset name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Asset name cannot exceed 100 characters' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @ApiProperty({ example: 'Laptops', description: 'Asset category name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Category name cannot exceed 50 characters' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  category: string;

  @ApiPropertyOptional({ example: 'Dell', description: 'Brand or manufacturer' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Brand cannot exceed 50 characters' })
  brand?: string;

  @ApiPropertyOptional({ example: 'Latitude 5450', description: 'Hardware model' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Model cannot exceed 50 characters' })
  model?: string;

  @ApiPropertyOptional({ example: 'SN-5450-9988', description: 'Manufacturer serial number' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Serial number cannot exceed 50 characters' })
  serialNumber?: string;

  @ApiPropertyOptional({
    enum: ['available', 'assigned', 'damaged', 'under_repair', 'lost', 'retired'],
    default: 'available',
    description: 'Current lifecycle status of the asset',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn([
    'available',
    'assigned',
    'damaged',
    'under_repair',
    'lost',
    'retired',
  ])
  status?: string;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Purchase date in YYYY-MM-DD format' })
  @IsOptional()
  @ValidateIf((o) => o.purchaseDate !== '' && o.purchaseDate != null)
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 1299.99, description: 'Purchase price in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Warranty expiry date in YYYY-MM-DD format' })
  @IsOptional()
  @ValidateIf((o) => o.warrantyExpiryDate !== "" && o.warrantyExpiryDate != null)
  @IsDateString()
  warrantyExpiryDate?: string;
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(["NEW", "GOOD", "FAIR", "DAMAGED"])
  condition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
