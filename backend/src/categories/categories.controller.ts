import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    data: {
      name: string;
      description?: string;
      active?: boolean;
    },
  ) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      active?: boolean;
    },
  ) {
    return this.categoriesService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(Number(id));
  }
}