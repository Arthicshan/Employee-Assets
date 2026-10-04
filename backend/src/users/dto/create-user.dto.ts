import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'sarah.connor@assetflow.com', description: 'Work email address' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  email: string;

  @ApiPropertyOptional({ example: 'UserPassword123!', description: 'Account password (defaults to User123! if omitted)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'Sarah', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  firstName: string;

  @ApiProperty({ example: 'Connor', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  lastName: string;

  @ApiPropertyOptional({ example: 'IT Support Specialist', description: 'User job position / title' })
  @IsOptional()
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  position?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE', description: 'System role' })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
  role?: string;

  @ApiPropertyOptional({ default: true, description: 'Active account status' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
