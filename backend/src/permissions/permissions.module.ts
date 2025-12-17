import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionGuard } from './permission.guard';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  providers: [PermissionsService, PermissionGuard],
  exports: [PermissionsService, PermissionGuard],
})
export class PermissionsModule {}


