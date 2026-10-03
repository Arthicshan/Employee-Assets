import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all asset categories with asset counts' })
  @ApiResponse({ status: 200, description: 'List of all categories retrieved successfully' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category details by ID' })
  @ApiResponse({ status: 200, description: 'Category details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new asset category' })
  @ApiResponse({ status: 201, description: 'Category successfully created' })
  @ApiResponse({ status: 400, description: 'Validation failed or duplicate category name' })
  create(@Body() data: CreateCategoryDto) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({ status: 200, description: 'Category successfully updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCategoryDto) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (only if no assets are linked)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with associated assets' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}