import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: 1, description: 'ID of the AVAILABLE equipment to assign' })
  @IsInt()
  @Min(1)
  assetId: number;

  @ApiProperty({ example: 1, description: 'ID of the ACTIVE employee receiving the equipment' })
  @IsInt()
  @Min(1)
  employeeId: number;

  @ApiPropertyOptional({ example: 'Assigned for engineering project work', description: 'Assignment remarks or purpose' })
  @IsOptional()
  @IsString()
  notes?: string;
}