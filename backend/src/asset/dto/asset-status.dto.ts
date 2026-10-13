import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssetStatusDto {
  @ApiProperty({
    enum: ['available', 'assigned', 'damaged', 'under_repair', 'lost', 'retired'],
    example: 'under_repair',
    description: 'New lifecycle status for the asset',
  })
  @IsIn(['available', 'assigned', 'damaged', 'under_repair', 'lost', 'retired'], {
    message: 'Status must be one of: available, assigned, damaged, under_repair, lost, retired',
  })
  status: string;

  @ApiPropertyOptional({
    example: 'Sent to vendor for screen replacement',
    description: 'Optional remarks explaining the status transition',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'Status notes cannot exceed 500 characters' })
  notes?: string;
}
