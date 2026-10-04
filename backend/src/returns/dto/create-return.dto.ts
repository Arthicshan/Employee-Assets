import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReturnDto {
  @ApiProperty({ example: 1, description: 'ID of the ACTIVE assignment being returned' })
  @IsInt()
  @Min(1)
  assignmentId: number;

  @ApiProperty({
    example: 'GOOD',
    enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'],
    description: 'Hardware condition upon return (GOOD/NEW/FAIR returns to available; DAMAGED sets status to damaged)',
  })
  @IsString()
  @IsIn(['NEW', 'GOOD', 'FAIR', 'DAMAGED'])
  condition: string;

  @ApiPropertyOptional({ example: 'Equipment returned in pristine shape with charger', description: 'Inspection or return notes' })
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsDateString()
  returnedAt?: string;
}