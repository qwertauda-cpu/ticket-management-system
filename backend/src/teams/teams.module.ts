import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TenantsModule } from '../tenants/tenants.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TenantsModule, PermissionsModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}

