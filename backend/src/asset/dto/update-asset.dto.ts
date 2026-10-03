import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateAssetDto {
  @IsOptional()
  @IsString({ message: 'Asset tag must be a string' })
  @IsNotEmpty({ message: 'Asset tag cannot be empty' })
  @MinLength(3, { message: 'Asset tag must be at least 3 characters (e.g. MOB-001)' })
  @MaxLength(30, { message: 'Asset tag cannot exceed 30 characters' })
  @Matches(/^[A-Za-z0-9\-_]+$/, {
    message: 'Asset tag must contain only alphanumeric characters, hyphens, and underscores without spaces (e.g. MOB-001)',
  })
  assetTag?: string;

  @IsOptional()
  @IsString({ message: 'Asset name must be a string' })
  @IsNotEmpty({ message: 'Asset name cannot be empty' })
  @MinLength(3, { message: 'Asset name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Asset name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Category is required' })
  @IsNotEmpty({ message: 'Category cannot be empty' })
  category?: string;

  @IsOptional()
  @ValidateIf((e) => e.brand !== '' && e.brand != null)
  @IsString()
  @MaxLength(50, { message: 'Brand cannot exceed 50 characters' })
  brand?: string;

  @IsOptional()
  @ValidateIf((e) => e.model !== '' && e.model != null)
  @IsString()
  @MaxLength(50, { message: 'Model cannot exceed 50 characters' })
  model?: string;

  @IsOptional()
  @ValidateIf((e) => e.serialNumber !== '' && e.serialNumber != null)
  @IsString()
  @MaxLength(50, { message: 'Serial number cannot exceed 50 characters' })
  serialNumber?: string;

  @IsOptional()
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
}
