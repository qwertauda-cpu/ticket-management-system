import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TicketsModule } from './tickets/tickets.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { ZonesModule } from './zones/zones.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [AuthModule, TenantsModule, PermissionsModule, UsersModule, TicketsModule, SuperAdminModule, ZonesModule, TeamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
