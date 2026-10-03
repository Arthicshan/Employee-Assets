import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-001', description: 'Unique company employee ID / badge number' })
  @IsString()
  @IsNotEmpty()
  employeeNo: string;

  @ApiProperty({ example: 'Alice', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Johnson', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'alice.johnson@company.com', description: 'Corporate email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Engineering', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Lead Software Architect', description: 'Job position / designation' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiPropertyOptional({ default: true, description: 'Whether the employee is active and eligible to receive equipment' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}