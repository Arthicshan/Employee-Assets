import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Process an equipment return with condition inspection' })
  @ApiResponse({ status: 201, description: 'Return processed, assignment closed, and asset condition updated within transaction' })
  @ApiResponse({ status: 400, description: 'Assignment already returned or invalid condition' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  create(@Body() data: CreateReturnDto) {
    return this.returnsService.create(data);
  }
}