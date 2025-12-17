import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../tenants/prisma.service';
import { TenantContextService } from '../tenants/tenant-context.service';

@Module({
  providers: [EmailService, PrismaService, TenantContextService],
  exports: [EmailService],
})
export class EmailModule {}

