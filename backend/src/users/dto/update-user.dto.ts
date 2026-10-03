import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'sarah.connor@assetflow.com', description: 'Work email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!', description: 'Optional new password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'Sarah', description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Connor', description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Operations Lead', description: 'User job position / title' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], description: 'System role' })
  @IsOptional()
  @IsIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
  role?: string;

  @ApiPropertyOptional({ description: 'Active account status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
