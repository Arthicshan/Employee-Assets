import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'EMP-001', description: 'Unique company employee ID / badge number' })
  @IsOptional()
  @IsString()
  employeeNo?: string;

  @ApiPropertyOptional({ example: 'Alice', description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Johnson', description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'alice.johnson@company.com', description: 'Corporate email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Engineering', description: 'Department name' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'Principal Software Engineer', description: 'Job position / designation' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: true, description: 'Active employment status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
