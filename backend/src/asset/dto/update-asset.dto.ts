import { Transform } from 'class-transformer';
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

export class UpdateAssetDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'Asset tag must be a string' })
  @IsNotEmpty({ message: 'Asset tag cannot be empty' })
  @MinLength(3, { message: 'Asset tag must be at least 3 characters (e.g. MOB-001)' })
  @MaxLength(30, { message: 'Asset tag cannot exceed 30 characters' })
  @Matches(/^[A-Za-z0-9\-_]+$/, {
    message: 'Asset tag must contain only alphanumeric characters, hyphens, and underscores without spaces (e.g. MOB-001)',
  })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  assetTag?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'Asset name must be a string' })
  @IsNotEmpty({ message: 'Asset name cannot be empty' })
  @MinLength(3, { message: 'Asset name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Asset name cannot exceed 100 characters' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'Category is required' })
  @IsNotEmpty({ message: 'Category cannot be empty' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Brand cannot exceed 50 characters' })
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Model cannot exceed 50 characters' })
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Serial number cannot exceed 50 characters' })
  serialNumber?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(
    ['available', 'assigned', 'damaged', 'under_repair', 'lost', 'retired'],
    {
      message:
        'Status must be one of: available, assigned, damaged, under_repair, lost, retired',
    },
  )
  status?: string;

  @IsOptional()
  @ValidateIf((e) => e.purchaseDate !== '' && e.purchaseDate != null)
  @IsDateString(
    {},
    {
      message:
        'Purchase date must be a valid date in format YYYY-MM-DD',
    },
  )
  purchaseDate?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

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
