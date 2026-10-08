import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, IsBoolean, Matches, MinLength, MaxLength } from 'class-validator';

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
  @IsNotEmpty({ message: 'First name is required' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  firstName: string;

  @ApiProperty({ example: 'Connor', description: 'Last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
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
