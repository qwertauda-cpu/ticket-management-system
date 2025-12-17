import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { TenantsModule } from '../tenants/tenants.module';
import { EmailModule } from '../email/email.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, TenantsModule, PermissionsModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}


