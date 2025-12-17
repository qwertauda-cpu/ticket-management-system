import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../../generated/prisma';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class SuperAdminService {
  private prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
  ) {
    this.prisma = new PrismaClient();
  }

  async login(dto: SuperAdminLoginDto) {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { email: dto.email },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, superAdmin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name,
      isSuperAdmin: true,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        isSuperAdmin: true,
      },
    };
  }

  async createCompany(dto: CreateCompanyDto) {
    // Check if admin email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new BadRequestException('Admin email already exists');
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

    // Create tenant, user, and subscription in a transaction
    const result = await this.prisma.$transaction(async (tx: any) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          companyName: dto.companyName,
          subscriptionPlan: dto.subscriptionPlan || 'Basic',
          subscriptionStatus: 'Active',
          subscriptionStartDate: dto.subscriptionStartDate ? new Date(dto.subscriptionStartDate) : new Date(),
          subscriptionEndDate: dto.subscriptionEndDate ? new Date(dto.subscriptionEndDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          maxUsers: dto.maxUsers || 10,
          maxTickets: dto.maxTickets || 1000,
          isActive: true,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: dto.adminEmail,
          passwordHash: hashedPassword,
          name: dto.adminName,
        },
      });

      // Link user to tenant as owner
      const tenantUser = await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          isActive: true,
        },
      });

      // Create wildcard permission for owner
      const ownerPermission = await tx.permission.create({
        data: {
          tenantId: tenant.id,
          key: '*',
          description: 'Full access (Owner)',
        },
      });

      // Assign wildcard permission to owner
      await tx.tenantUserPermission.create({
        data: {
          tenantId: tenant.id,
          tenantUserId: tenantUser.id,
          permissionId: ownerPermission.id,
        },
      });

      // Create subscription record
      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planName: dto.subscriptionPlan || 'Basic',
          price: dto.subscriptionPlan === 'Enterprise' ? 500 : dto.subscriptionPlan === 'Pro' ? 200 : 100,
          startDate: dto.subscriptionStartDate ? new Date(dto.subscriptionStartDate) : new Date(),
          endDate: dto.subscriptionEndDate ? new Date(dto.subscriptionEndDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'Active',
        },
      });

      return { tenant, user, tenantUser, subscription };
    });

    return {
      tenant: result.tenant,
      admin: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      subscription: result.subscription,
    };
  }

  async listCompanies() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        tenantUsers: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tenantUsers: true,
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((tenant: any) => {
      // Find the owner (user with * permission or first user)
      const owner = tenant.tenantUsers[0]?.user;
      
      return {
        id: tenant.id,
        companyName: tenant.companyName,
        ownerName: owner?.name || 'N/A',
        ownerEmail: owner?.email || 'N/A',
        subscriptionPlan: tenant.subscriptionPlan,
        subscriptionStatus: tenant.subscriptionStatus,
        subscriptionStartDate: tenant.subscriptionStartDate,
        subscriptionEndDate: tenant.subscriptionEndDate,
        maxUsers: tenant.maxUsers,
        maxTickets: tenant.maxTickets,
        isActive: tenant.isActive,
        userCount: tenant._count.tenantUsers,
        ticketCount: tenant._count.tickets,
        createdAt: tenant.createdAt,
      };
    });
  }

  async getCompanyById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tenantUsers: true,
            tickets: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Company not found');
    }

    return {
      ...tenant,
      userCount: tenant._count.tenantUsers,
      ticketCount: tenant._count.tickets,
    };
  }

  async updateCompany(id: string, data: any) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        companyName: data.companyName,
        subscriptionPlan: data.subscriptionPlan,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionStartDate: data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : undefined,
        subscriptionEndDate: data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : undefined,
        maxUsers: data.maxUsers,
        maxTickets: data.maxTickets,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });

    return tenant;
  }

  async toggleCompanyStatus(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Company not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        isActive: !tenant.isActive,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async getDashboardStats() {
    const [totalCompanies, activeCompanies, totalUsers, totalTickets] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.ticket.count(),
    ]);

    const recentCompanies = await this.prisma.tenant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        subscriptionPlan: true,
        createdAt: true,
      },
    });

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalTickets,
      recentCompanies,
    };
  }

  // Subscriptions
  async listSubscriptions() {
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return subscriptions;
  }

  async getSubscriptionById(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  // Invoices
  async listInvoices() {
    const invoices = await this.prisma.invoice.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return invoices;
  }

  async createInvoice(data: any) {
    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId: data.tenantId,
        amount: data.amount,
        status: data.status || 'Pending',
        dueDate: new Date(data.dueDate),
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });
    return invoice;
  }

  async updateInvoice(id: string, data: any) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        amount: data.amount,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        updatedAt: new Date(),
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });
    return invoice;
  }
}

