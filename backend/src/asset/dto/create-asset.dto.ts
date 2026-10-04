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
  ValidateIf,
} from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'LAP-0012', description: 'Unique asset inventory tag' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  assetTag: string;

  @ApiProperty({ example: 'Dell Latitude 5450', description: 'Equipment name/title' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @ApiProperty({ example: 'Laptops', description: 'Asset category name' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  category: string;

  @ApiPropertyOptional({ example: 'Dell', description: 'Brand or manufacturer' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Latitude 5450', description: 'Hardware model' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'SN-5450-9988', description: 'Manufacturer serial number' })
  @IsOptional()
  @IsString()
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
  notes?: string;
}
