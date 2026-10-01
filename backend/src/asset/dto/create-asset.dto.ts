import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  assetTag: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

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

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;
}