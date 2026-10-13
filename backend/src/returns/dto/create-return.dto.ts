import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReturnDto {
  @ApiProperty({ example: 1, description: 'ID of the ACTIVE assignment being returned' })
  @IsInt({ message: 'Assignment ID must be a valid integer' })
  @Min(1, { message: 'Assignment ID must be a positive integer' })
  assignmentId: number;

  @ApiProperty({
    example: 'GOOD',
    enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
    description: 'Hardware condition upon return (GOOD/NEW/FAIR returns to available; DAMAGED sets status to damaged)',
  })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsIn(['NEW', 'GOOD', 'FAIR', 'DAMAGED'], {
    message: 'Return condition must be one of: NEW, GOOD, FAIR, DAMAGED',
  })
  condition: string;

  @ApiPropertyOptional({ example: 'Equipment returned in pristine shape with charger', description: 'Inspection or return notes' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'Return notes cannot exceed 500 characters' })
  notes?: string;

  @ApiPropertyOptional({ example: '2026-10-13T10:30:00.000Z', description: 'Optional ISO return timestamp' })
  @IsOptional()
  @IsDateString()
  returnedAt?: string;
}