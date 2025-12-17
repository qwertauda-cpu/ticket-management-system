import { Injectable } from '@nestjs/common';
import { PrismaService } from '../tenants/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async hasPermission(tenantUserId: string, permissionKey: string): Promise<boolean> {
    const prismaClient: any = this.prisma.client as any;

    if (!prismaClient.tenantUserPermission?.findFirst) {
      throw new Error(
        'Prisma Client is missing TenantUserPermission. Ensure prisma/schema.prisma defines TenantUserPermission and run prisma generate.',
      );
    }
    if (!prismaClient.permission?.findFirst) {
      throw new Error(
        'Prisma Client is missing Permission. Ensure prisma/schema.prisma defines Permission and run prisma generate.',
      );
    }

    // Tenant scoping is enforced by the existing Prisma $extends middleware (TenantUserPermission must have tenantId).
    const row = await prismaClient.tenantUserPermission.findFirst({
      where: {
        tenantUserId,
        permission: { key: permissionKey },
      },
      select: { id: true },
    });

    return Boolean(row);
  }

  async hasAnyPermission(tenantUserId: string, permissionKeys: string[]): Promise<boolean> {
    if (permissionKeys.length === 0) return true;
    const prismaClient: any = this.prisma.client as any;

    const row = await prismaClient.tenantUserPermission.findFirst({
      where: {
        tenantUserId,
        permission: { key: { in: permissionKeys } },
      },
      select: { id: true },
    });

    return Boolean(row);
  }
}


