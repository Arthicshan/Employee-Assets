import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-001', description: 'Unique company employee ID / badge number' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  employeeNo: string;

  @ApiProperty({ example: 'Alice', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  firstName: string;

  @ApiProperty({ example: 'Johnson', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  lastName: string;

  @ApiProperty({ example: 'alice.johnson@company.com', description: 'Corporate email address' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  email: string;

  @ApiProperty({ example: 'Engineering', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  department: string;

  @ApiProperty({ example: 'Lead Software Architect', description: 'Job position / designation' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  position: string;

  @ApiPropertyOptional({ default: true, description: 'Whether the employee is active and eligible to receive equipment' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
