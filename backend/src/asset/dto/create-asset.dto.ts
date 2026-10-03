import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'LAP-0012', description: 'Unique asset inventory tag' })
  @IsString()
  @IsNotEmpty()
  assetTag: string;

  @ApiProperty({ example: 'Dell Latitude 5450', description: 'Equipment name/title' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Laptops', description: 'Asset category name' })
  @IsString()
  @IsNotEmpty()
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