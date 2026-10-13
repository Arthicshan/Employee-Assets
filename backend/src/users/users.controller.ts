import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.constant';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all system users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of system users' })
  findAll(@Query() query: ListQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new system user account (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user position, role, or active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle user active/deactive status (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status toggled' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const currentUserId = req.user?.id || req.user?.userId;
    return this.usersService.remove(id, currentUserId);
  }
}
