import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Returns')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Process equipment return and inspect condition (Admin & Manager)' })
  @ApiResponse({ status: 201, description: 'Return processed and asset status updated' })
  @ApiResponse({ status: 400, description: 'Assignment already returned or invalid condition' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  create(@Body() data: CreateReturnDto) {
    return this.returnsService.create(data);
  }
}