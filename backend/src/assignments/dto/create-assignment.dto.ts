import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  @Min(1)
  assetId: number;

  @IsInt()
  @Min(1)
  employeeId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}