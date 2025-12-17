import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { TenantAdminGuard } from './tenant-admin.guard';
import { TenantContextInterceptor } from './tenant-context.interceptor';
import { TenantContextService } from './tenant-context.service';

@Module({
  providers: [
    TenantContextService,
    PrismaService,
    TenantAdminGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
  exports: [TenantContextService, PrismaService, TenantAdminGuard],
})
export class TenantsModule {}


