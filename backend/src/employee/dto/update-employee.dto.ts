import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsString,
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
  firstName?: string;

  @ApiPropertyOptional({ example: 'Johnson', description: 'Last name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
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
