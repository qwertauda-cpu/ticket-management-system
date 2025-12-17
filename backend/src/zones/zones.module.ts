import { Module } from '@nestjs/common';
import { ZonesController } from './zones.controller';
import { ZonesService } from './zones.service';
import { TenantsModule } from '../tenants/tenants.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TenantsModule, PermissionsModule],
  controllers: [ZonesController],
  providers: [ZonesService],
  exports: [ZonesService],
})
export class ZonesModule {}

