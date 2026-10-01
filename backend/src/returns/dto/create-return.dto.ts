import {
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReturnDto {
  @IsInt()
  @Min(1)
  assignmentId: number;

  @IsString()
  @IsIn(['NEW', 'GOOD', 'FAIR', 'DAMAGED'])
  condition: string;

  @IsOptional()
  @IsString()
  notes?: string;
}