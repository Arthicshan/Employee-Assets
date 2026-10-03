import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@assetflow.com', description: 'Work email address or username' })
  @IsString({ message: 'Email or username must be a string' })
  @IsNotEmpty({ message: 'Email or username is required' })
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Account password (min. 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
