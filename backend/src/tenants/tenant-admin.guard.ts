import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

function parseAdminEmails(envValue: string | undefined): Set<string> {
  if (!envValue) return new Set();
  return new Set(
    envValue
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v.length > 0),
  );
}

@Injectable()
export class TenantAdminGuard implements CanActivate {
  private readonly adminEmails: Set<string>;

  constructor(private readonly prisma: PrismaService) {
    this.adminEmails = parseAdminEmails(process.env.TENANT_ADMIN_EMAILS);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string | undefined = request?.user?.sub || request?.user?.userId;
    const isOwner: boolean | undefined = request?.user?.isOwner;

    if (!userId) {
      throw new ForbiddenException('Missing authenticated user');
    }

    // If user is marked as owner in JWT, allow access
    if (isOwner === true) {
      return true;
    }

    // Fallback to email-based admin check if configured
    if (this.adminEmails.size > 0) {
      const prismaClient: any = this.prisma.client as any;
      if (!prismaClient.user?.findUnique) {
        throw new Error(
          'Prisma Client is missing the User model. Ensure prisma/schema.prisma defines User and run prisma generate.',
        );
      }

      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const email = (user?.email as string | undefined)?.toLowerCase();
      if (email && this.adminEmails.has(email)) {
        return true;
      }
    }

    throw new ForbiddenException('Admin access required');
  }
}


