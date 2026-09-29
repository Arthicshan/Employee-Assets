import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  findAll() {
    return this.assetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: CreateAssetDto) {
    return this.assetService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: CreateAssetDto,
  ) {
    return this.assetService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(Number(id));
  }

  @Patch(':id/assign/:employeeId')
  assignToEmployee(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.assetService.assignToEmployee(
      Number(id),
      Number(employeeId),
    );
  }

  @Patch(':id/unassign')
unassignFromEmployee(@Param('id') id: string) {
  return this.assetService.unassignFromEmployee(Number(id));
}


}