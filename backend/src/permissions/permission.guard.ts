import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../tenants/tenant-context.service';
import { PrismaService } from '../tenants/prisma.service';
import { REQUIRE_PERMISSIONS_KEY } from './permissions.constants';
import { PermissionsService } from './permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
    private readonly prisma: PrismaService,
    private readonly permissions: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request?.user?.sub || request?.user?.userId;
    const tenantId: string | undefined = request?.user?.tenantId;

    if (!userId || !tenantId) {
      throw new ForbiddenException('Missing tenant context');
    }

    // Guards run before interceptors; ensure tenant-scoped permission checks still run under tenant context.
    const ok = await this.tenantContext.runWithTenantId(tenantId, async () => {
      const prismaClient: any = this.prisma.client as any;
      if (!prismaClient.tenantUser?.findFirst) {
        throw new Error(
          'Prisma Client is missing TenantUser. Ensure prisma/schema.prisma defines TenantUser and run prisma generate.',
        );
      }

      const tenantUser = await prismaClient.tenantUser.findFirst({
        where: { tenantId, userId },
        select: { id: true },
      });

      if (!tenantUser?.id) {
        throw new ForbiddenException('User is not a member of this tenant');
      }

      // Check for wildcard permission (owner)
      const hasWildcard = await this.permissions.hasAnyPermission(tenantUser.id, ['*']);
      if (hasWildcard) {
        return true;
      }

      return this.permissions.hasAnyPermission(tenantUser.id, required);
    });

    if (!ok) throw new ForbiddenException('Missing required permission');

    return true;
  }
}


