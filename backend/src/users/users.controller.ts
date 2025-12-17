import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { TenantAdminGuard } from '../tenants/tenant-admin.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantAdminGuard, PermissionGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  async listUsers() {
    return this.users.listUsersInCurrentTenant();
  }

  @Post()
  @RequirePermissions('users:write')
  async createOrAttach(@Body() dto: CreateUserDto) {
    return this.users.createOrAttachUser(dto);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('users:write')
  async deactivate(@Param('id') id: string) {
    return this.users.deactivateUserInCurrentTenant(id);
  }

  @Patch(':id/reactivate')
  @RequirePermissions('users:write')
  async reactivate(@Param('id') id: string) {
    return this.users.reactivateUserInCurrentTenant(id);
  }
}


