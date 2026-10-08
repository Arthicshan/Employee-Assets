import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'EMP-001', description: 'Unique company employee ID / badge number' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  employeeNo?: string;

  @ApiPropertyOptional({ example: 'Alice', description: 'First name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Johnson', description: 'Last name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  lastName?: string;

  @ApiPropertyOptional({ example: 'alice.johnson@company.com', description: 'Corporate email address' })
  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  email?: string;

  @ApiPropertyOptional({ example: 'Engineering', description: 'Department name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  department?: string;

  @ApiPropertyOptional({ example: 'Principal Software Engineer', description: 'Job position / designation' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  position?: string;

  @ApiPropertyOptional({ example: true, description: 'Active employment status' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
