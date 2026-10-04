import { ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'sarah.connor@assetflow.com', description: 'Work email address' })
  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  email?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!', description: 'Optional new password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'Sarah', description: 'First name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Connor', description: 'Last name' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Operations Lead', description: 'User job position / title' })
  @IsOptional()
  @IsString()
  @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
  position?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], description: 'System role' })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['ADMIN', 'MANAGER', 'EMPLOYEE'])
  role?: string;

  @ApiPropertyOptional({ description: 'Active account status' })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
