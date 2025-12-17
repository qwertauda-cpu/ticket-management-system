import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [AuthModule, TenantsModule, PermissionsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}


