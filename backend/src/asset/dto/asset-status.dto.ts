import { IsIn, IsOptional, IsString } from 'class-validator';
export class AssetStatusDto {
  @IsIn(['available','assigned','damaged','under_repair','lost','retired']) status: string;
  @IsOptional() @IsString() notes?: string;
}
