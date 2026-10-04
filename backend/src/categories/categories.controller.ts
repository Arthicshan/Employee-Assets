import { Query, ParseIntPipe as IdPipe } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List all asset categories (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  findAll(@Query() query: ListQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get category details by ID (Admin & Manager)' })
  @ApiResponse({ status: 200, description: 'Category details returned' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', IdPipe) id: string) {
    return this.categoriesService.findOne(Number(id));
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new asset category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  create(
    @Body()
    data: CreateCategoryDto,
  ) {
    return this.categoriesService.create(data);
  }

  @Put(':id')
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an asset category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  update(
    @Param('id', IdPipe) id: string,
    @Body()
    data: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(Number(id), data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an asset category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  remove(@Param('id', IdPipe) id: string) {
    return this.categoriesService.remove(Number(id));
  }
}
