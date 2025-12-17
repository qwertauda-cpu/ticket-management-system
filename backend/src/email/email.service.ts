import { Injectable } from '@nestjs/common';
import { PrismaService } from '../tenants/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    // Configure email transporter
    // For testing, we'll use console logging
    // In production, configure with real SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });
  }

  /**
   * إرسال إشعار بريد إلكتروني
   */
  async sendEmail(
    recipientEmail: string,
    recipientName: string,
    subject: string,
    body: string,
    type: string,
    tenantId?: string
  ) {
    try {
      const prismaClient: any = this.prisma.client as any;
      // Create email notification record
      const notification = await prismaClient.emailNotification.create({
        data: {
          tenantId,
          recipientEmail,
          recipientName,
          subject,
          body,
          type,
          status: 'Pending',
        },
      });

      // For development/testing, just log the email
      console.log('\n📧 ===== EMAIL NOTIFICATION =====');
      console.log(`To: ${recipientName} <${recipientEmail}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Type: ${type}`);
      console.log(`Body:\n${body}`);
      console.log('================================\n');

      // In production, uncomment this to actually send emails:
      /*
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@ticketsystem.com',
        to: recipientEmail,
        subject,
        html: body,
      });
      */

      // Update notification status
      await prismaClient.emailNotification.update({
        where: { id: notification.id },
        data: {
          status: 'Sent',
          sentAt: new Date(),
        },
      });

      return { success: true, notificationId: notification.id };
    } catch (error) {
      console.error('❌ Email sending failed:', error);

      // Log error in database
      const prismaClient: any = this.prisma.client as any;
      await prismaClient.emailNotification.updateMany({
        where: {
          recipientEmail,
          status: 'Pending',
        },
        data: {
          status: 'Failed',
          error: error.message,
        },
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * إرسال إشعار بإنشاء فاتورة
   */
  async sendInvoiceCreatedEmail(tenantId: string, invoice: any) {
    const prismaClient: any = this.prisma.client as any;
    const tenant = await prismaClient.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantUsers: {
          where: {
            permissions: {
              some: {
                permission: { key: '*' }
              }
            }
          },
          include: {
            user: true
          },
          take: 1
        }
      }
    });

    if (!tenant || !tenant.tenantUsers[0]) {
      return;
    }

    const owner = tenant.tenantUsers[0].user;
    const subject = `فاتورة جديدة - ${invoice.invoiceNumber}`;
    const body = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #667eea; text-align: center;">فاتورة جديدة</h2>
          
          <p>عزيزي/عزيزتي ${owner.name},</p>
          
          <p>تم إنشاء فاتورة جديدة لشركتكم <strong>${tenant.companyName}</strong>:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>المبلغ:</strong> ${invoice.amount.toLocaleString()} دينار عراقي</p>
            <p><strong>عدد الموظفين:</strong> ${invoice.userCount}</p>
            <p><strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-IQ')}</p>
          </div>
          
          <p>يرجى سداد المبلغ قبل تاريخ الاستحقاق.</p>
          
          <p style="margin-top: 30px; color: #666;">مع تحياتنا،<br>فريق نظام إدارة التذاكر</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      owner.email,
      owner.name,
      subject,
      body,
      'INVOICE_CREATED',
      tenantId
    );
  }

  /**
   * إرسال إشعار بدفع فاتورة
   */
  async sendInvoicePaidEmail(tenantId: string, invoice: any) {
    const prismaClient: any = this.prisma.client as any;
    const tenant = await prismaClient.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantUsers: {
          where: {
            permissions: {
              some: {
                permission: { key: '*' }
              }
            }
          },
          include: {
            user: true
          },
          take: 1
        }
      }
    });

    if (!tenant || !tenant.tenantUsers[0]) {
      return;
    }

    const owner = tenant.tenantUsers[0].user;
    const subject = `تم دفع الفاتورة - ${invoice.invoiceNumber}`;
    const body = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #28a745; text-align: center;">✅ تم دفع الفاتورة</h2>
          
          <p>عزيزي/عزيزتي ${owner.name},</p>
          
          <p>تم تسجيل دفع الفاتورة بنجاح:</p>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
            <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>المبلغ المدفوع:</strong> ${invoice.amount.toLocaleString()} دينار عراقي</p>
            <p><strong>تاريخ الدفع:</strong> ${new Date(invoice.paidAt).toLocaleDateString('ar-IQ')}</p>
            ${invoice.paymentMethod ? `<p><strong>طريقة الدفع:</strong> ${invoice.paymentMethod}</p>` : ''}
          </div>
          
          <p>شكراً لكم على الدفع في الوقت المحدد.</p>
          
          <p style="margin-top: 30px; color: #666;">مع تحياتنا،<br>فريق نظام إدارة التذاكر</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      owner.email,
      owner.name,
      subject,
      body,
      'INVOICE_PAID',
      tenantId
    );
  }

  /**
   * إرسال إشعار بالوصول لحد الموظفين
   */
  async sendUserLimitReachedEmail(tenantId: string) {
    const prismaClient: any = this.prisma.client as any;
    const tenant = await prismaClient.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantUsers: {
          where: {
            permissions: {
              some: {
                permission: { key: '*' }
              }
            }
          },
          include: {
            user: true
          },
          take: 1
        },
        _count: {
          select: { tenantUsers: true }
        }
      }
    });

    if (!tenant || !tenant.tenantUsers[0]) {
      return;
    }

    const owner = tenant.tenantUsers[0].user;
    const subject = `تنبيه: تم الوصول للحد الأقصى من الموظفين`;
    const body = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffc107; text-align: center;">⚠️ تنبيه مهم</h2>
          
          <p>عزيزي/عزيزتي ${owner.name},</p>
          
          <p>لقد وصلتم للحد الأقصى من عدد الموظفين المسموح به في خطتكم الحالية:</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <p><strong>عدد الموظفين الحالي:</strong> ${tenant._count.tenantUsers}</p>
            <p><strong>الحد الأقصى المسموح:</strong> ${tenant.maxUsers}</p>
          </div>
          
          <p>لإضافة المزيد من الموظفين، يرجى التواصل معنا لترقية خطتكم.</p>
          
          <p style="margin-top: 30px; color: #666;">مع تحياتنا،<br>فريق نظام إدارة التذاكر</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      owner.email,
      owner.name,
      subject,
      body,
      'USER_LIMIT_REACHED',
      tenantId
    );
  }

  /**
   * الحصول على جميع الإشعارات
   */
  async getAllNotifications() {
    const prismaClient: any = this.prisma.client as any;
    return prismaClient.emailNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * الحصول على إشعارات شركة معينة
   */
  async getNotificationsByTenant(tenantId: string) {
    const prismaClient: any = this.prisma.client as any;
    return prismaClient.emailNotification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

