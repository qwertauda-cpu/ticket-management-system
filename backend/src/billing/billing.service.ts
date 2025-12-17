import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../tenants/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * إنشاء فاتورة جديدة لشركة
   */
  async createInvoice(tenantId: string) {
    const prismaClient: any = this.prisma.client as any;
    // Get tenant info
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

    const userCount = tenant._count.tenantUsers;
    const amount = userCount * tenant.pricePerUser;

    // Generate invoice number
    const invoiceCount = await prismaClient.invoice.count({
      where: { tenantId }
    });
    const invoiceNumber = `INV-${tenant.companyName.substring(0, 3).toUpperCase()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice
    const invoice = await prismaClient.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        amount,
        userCount,
        description: `فاتورة شهرية - ${userCount} موظف × ${tenant.pricePerUser} دينار`,
        status: 'Unpaid',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Send email notification
    await this.emailService.sendInvoiceCreatedEmail(tenantId, invoice);

    return invoice;
  }

  /**
   * الحصول على جميع الفواتير
   */
  async getAllInvoices() {
    const prismaClient: any = this.prisma.client as any;
    const invoices = await prismaClient.invoice.findMany({
      include: {
        tenant: {
          select: {
            companyName: true,
            tenantUsers: {
              where: {
                permissions: {
                  some: {
                    permission: {
                      key: '*'
                    }
                  }
                }
              },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      companyName: invoice.tenant.companyName,
      ownerName: invoice.tenant.tenantUsers[0]?.user?.name || 'N/A',
      ownerEmail: invoice.tenant.tenantUsers[0]?.user?.email || 'N/A',
      amount: invoice.amount,
      userCount: invoice.userCount,
      description: invoice.description,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
    }));
  }

  /**
   * الحصول على فواتير شركة معينة
   */
  async getInvoicesByTenant(tenantId: string) {
    const prismaClient: any = this.prisma.client as any;
    return prismaClient.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * تحديث حالة الفاتورة
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: string,
    paymentMethod?: string,
    notes?: string
  ) {
    const data: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'Paid') {
      data.paidAt = new Date();
    }

    if (paymentMethod) {
      data.paymentMethod = paymentMethod;
    }

    if (notes) {
      data.notes = notes;
    }

    const prismaClient: any = this.prisma.client as any;
    const invoice = await prismaClient.invoice.update({
      where: { id: invoiceId },
      data,
      include: {
        tenant: true
      }
    });

    // Send email notification if invoice was marked as paid
    if (status === 'Paid') {
      await this.emailService.sendInvoicePaidEmail(invoice.tenantId, invoice);
    }

    return invoice;
  }

  /**
   * حذف فاتورة
   */
  async deleteInvoice(invoiceId: string) {
    const prismaClient: any = this.prisma.client as any;
    await prismaClient.invoice.delete({
      where: { id: invoiceId },
    });

    return { message: 'Invoice deleted successfully' };
  }

  /**
   * إحصائيات الفواتير
   */
  async getInvoiceStats() {
    const prismaClient: any = this.prisma.client as any;
    const [totalInvoices, unpaidInvoices, paidInvoices, overdueInvoices] = await Promise.all([
      prismaClient.invoice.count(),
      prismaClient.invoice.count({ where: { status: 'Unpaid' } }),
      prismaClient.invoice.count({ where: { status: 'Paid' } }),
      prismaClient.invoice.count({
        where: {
          status: 'Unpaid',
          dueDate: { lt: new Date() }
        }
      }),
    ]);

    const totalRevenue = await prismaClient.invoice.aggregate({
      where: { status: 'Paid' },
      _sum: { amount: true },
    });

    const pendingRevenue = await prismaClient.invoice.aggregate({
      where: { status: 'Unpaid' },
      _sum: { amount: true },
    });

    return {
      totalInvoices,
      unpaidInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingRevenue: pendingRevenue._sum.amount || 0,
    };
  }
}

