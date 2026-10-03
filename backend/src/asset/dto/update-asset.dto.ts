import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'LAP-0012', description: 'Unique asset inventory tag' })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({ example: 'Dell Latitude 5450', description: 'Equipment name/title' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Laptops', description: 'Asset category name' })
  @IsOptional()
  @IsString()
  category?: string;

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
    description: 'Current lifecycle status of the asset',
  })
  @IsOptional()
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
  @IsDateString()
  purchaseDate?: string;
}
