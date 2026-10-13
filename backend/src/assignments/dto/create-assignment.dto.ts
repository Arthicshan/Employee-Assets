import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: 1, description: 'ID of the available asset to assign' })
  @IsInt({ message: 'Asset ID must be a valid integer' })
  @Min(1, { message: 'Asset ID must be a positive integer' })
  assetId: number;

  @ApiProperty({ example: 1, description: 'ID of the active employee receiving the asset' })
  @IsInt({ message: 'Employee ID must be a valid integer' })
  @Min(1, { message: 'Employee ID must be a positive integer' })
  employeeId: number;

  @ApiPropertyOptional({ example: 'Issued for new engineering onboarding', description: 'Optional custody notes' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'Assignment notes cannot exceed 500 characters' })
  notes?: string;

  @ApiPropertyOptional({ example: '2026-10-13T08:00:00.000Z', description: 'Optional ISO assignment timestamp' })
  @IsOptional()
  @IsDateString()
  assignedAt?: string;
}