import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { SuperAdminGuard } from '../super-admin/super-admin.guard';

@Controller('super-admin/billing')
@UseGuards(SuperAdminGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  async getAllInvoices() {
    return this.billingService.getAllInvoices();
  }

  @Get('invoices/tenant/:tenantId')
  async getInvoicesByTenant(@Param('tenantId') tenantId: string) {
    return this.billingService.getInvoicesByTenant(tenantId);
  }

  @Get('stats')
  async getInvoiceStats() {
    return this.billingService.getInvoiceStats();
  }

  @Post('invoices/tenant/:tenantId')
  async createInvoice(@Param('tenantId') tenantId: string) {
    return this.billingService.createInvoice(tenantId);
  }

  @Patch('invoices/:invoiceId')
  async updateInvoiceStatus(
    @Param('invoiceId') invoiceId: string,
    @Body() body: { status: string; paymentMethod?: string; notes?: string }
  ) {
    return this.billingService.updateInvoiceStatus(
      invoiceId,
      body.status,
      body.paymentMethod,
      body.notes
    );
  }

  @Delete('invoices/:invoiceId')
  async deleteInvoice(@Param('invoiceId') invoiceId: string) {
    return this.billingService.deleteInvoice(invoiceId);
  }
}

