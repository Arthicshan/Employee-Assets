import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class ListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() department?: string;
  @IsOptional() @IsIn(["ADMIN","MANAGER","EMPLOYEE"]) role?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) employeeId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) assetId?: number;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
