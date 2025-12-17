import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../tenants/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Find user by email (global search, not tenant-scoped)
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
      include: {
        tenantUsers: {
          where: { isActive: true },
          include: {
            tenant: true,
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get first active tenant (in real app, user might select tenant)
    const tenantUser = user.tenantUsers[0];
    if (!tenantUser) {
      throw new UnauthorizedException('No active tenant found');
    }

    // Get permissions
    const permissions = tenantUser.permissions.map((p) => p.permission.key);

    // Check if user is owner/admin
    const isOwner = permissions.includes('*') || permissions.includes('owner');

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: tenantUser.tenantId,
      tenantUserId: tenantUser.id,
      permissions,
      isOwner,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: tenantUser.tenantId,
        tenantName: tenantUser.tenant.name,
        permissions,
        isOwner,
      },
    };
  }
}

