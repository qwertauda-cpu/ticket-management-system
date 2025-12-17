import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../tenants/prisma.service';
import { TenantContextService } from '../tenants/tenant-context.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';

export type TenantUserView = {
  id: string;
  email: string;
  name?: string | null;
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly emailService: EmailService,
  ) {}

  async listUsersInCurrentTenant(): Promise<TenantUserView[]> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    if (!prismaClient.tenantUser?.findMany) {
      throw new Error(
        'Prisma Client is missing the TenantUser model. Ensure prisma/schema.prisma defines TenantUser and run prisma generate.',
      );
    }

    const rows = await prismaClient.tenantUser.findMany({
      where: { tenantId },
      include: {
        user: {
          select: { id: true, email: true, name: true, createdAt: true },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((tu: any) => ({
      id: tu.user.id,
      email: tu.user.email,
      name: tu.user.name,
      isActive: tu.isActive,
      permissions: tu.permissions.map((p: any) => p.permission.key),
      createdAt: tu.user.createdAt,
    }));
  }

  async createOrAttachUser(dto: CreateUserDto): Promise<TenantUserView> {
    const tenantId = this.requireTenantId();
    const email = dto.email.trim().toLowerCase();

    const prismaClient: any = this.prisma.client as any;
    if (!prismaClient.user?.findUnique || !prismaClient.tenantUser?.updateMany) {
      throw new Error(
        'Prisma Client is missing required models (User, TenantUser). Ensure prisma/schema.prisma defines them and run prisma generate.',
      );
    }

    // ✅ Check subscription limit BEFORE creating user
    const tenant = await prismaClient.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { tenantUsers: true }
        }
      }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if adding this user would exceed the limit
    if (tenant._count.tenantUsers >= tenant.maxUsers) {
      // Send email notification
      await this.emailService.sendUserLimitReachedEmail(tenantId);
      
      throw new BadRequestException(
        `تم الوصول للحد الأقصى من الموظفين (${tenant.maxUsers}). يرجى الترقية للحصول على المزيد من المستخدمين.`
      );
    }

    const passwordHash =
      dto.password !== undefined ? await bcrypt.hash(dto.password, 12) : undefined;

    const result = await prismaClient.$transaction(async (tx: any) => {
      let user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        if (!passwordHash) {
          throw new BadRequestException('password is required when creating a new user');
        }

        user = await tx.user.create({
          data: {
            email,
            passwordHash,
            name: dto.name,
          },
        });
      } else {
        const data: Record<string, any> = {};
        if (passwordHash) data.passwordHash = passwordHash;
        if (dto.name !== undefined) data.name = dto.name;

        if (Object.keys(data).length > 0) {
          user = await tx.user.update({
            where: { id: user.id },
            data,
          });
        }
      }

      const updated = await tx.tenantUser.updateMany({
        where: { tenantId, userId: user.id },
        data: { isActive: true },
      });

      if (updated.count === 0) {
        await tx.tenantUser.create({
          data: {
            tenantId,
            userId: user.id,
            isActive: true,
          },
        });
      }

      let tenantUser = await tx.tenantUser.findFirst({
        where: { tenantId, userId: user.id },
        include: {
          user: {
            select: { id: true, email: true, name: true, createdAt: true },
          },
        },
      });

      if (!tenantUser) {
        throw new Error('Failed to create/attach user to tenant');
      }

      // Add permissions if provided
      if (dto.permissions && dto.permissions.length > 0) {
        // First, get or create permissions
        for (const permKey of dto.permissions) {
          let permission = await tx.permission.findFirst({
            where: { tenantId, key: permKey },
          });

          if (!permission) {
            permission = await tx.permission.create({
              data: {
                tenantId,
                key: permKey,
                description: permKey,
              },
            });
          }

          // Check if permission already assigned
          const existing = await tx.tenantUserPermission.findFirst({
            where: {
              tenantUserId: tenantUser.id,
              permissionId: permission.id,
            },
          });

          if (!existing) {
            await tx.tenantUserPermission.create({
              data: {
                tenantId,
                tenantUserId: tenantUser.id,
                permissionId: permission.id,
              },
            });
          }
        }
      }

      return tenantUser;
    });

    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      isActive: result.isActive,
      permissions: [],
      createdAt: result.user.createdAt,
    };
  }

  async deactivateUserInCurrentTenant(userId: string): Promise<{ userId: string; isActive: false }> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const updated = await prismaClient.tenantUser.updateMany({
      where: { tenantId, userId },
      data: { isActive: false },
    });

    if (updated.count === 0) {
      throw new NotFoundException('User is not attached to this tenant');
    }

    return { userId, isActive: false };
  }

  async reactivateUserInCurrentTenant(userId: string): Promise<{ userId: string; isActive: true }> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const updated = await prismaClient.tenantUser.updateMany({
      where: { tenantId, userId },
      data: { isActive: true },
    });

    if (updated.count === 0) {
      throw new NotFoundException('User is not attached to this tenant');
    }

    return { userId, isActive: true };
  }

  private requireTenantId(): string {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      // With JwtAuthGuard + TenantContextInterceptor this should never happen.
      throw new BadRequestException('Tenant context missing');
    }
    return tenantId;
  }
}


