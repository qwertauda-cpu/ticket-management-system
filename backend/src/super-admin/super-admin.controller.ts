import { Body, Controller, Get, Post, Patch, Param, UseGuards, ValidationPipe } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SuperAdminGuard } from './super-admin.guard';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('login')
  async login(@Body(ValidationPipe) dto: SuperAdminLoginDto) {
    return this.superAdminService.login(dto);
  }

  @Post('companies')
  @UseGuards(SuperAdminGuard)
  async createCompany(@Body(ValidationPipe) dto: CreateCompanyDto) {
    return this.superAdminService.createCompany(dto);
  }

  @Get('companies')
  @UseGuards(SuperAdminGuard)
  async listCompanies() {
    return this.superAdminService.listCompanies();
  }

  @Get('companies/:id')
  @UseGuards(SuperAdminGuard)
  async getCompany(@Param('id') id: string) {
    return this.superAdminService.getCompanyById(id);
  }

  @Patch('companies/:id')
  @UseGuards(SuperAdminGuard)
  async updateCompany(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateCompanyDto) {
    return this.superAdminService.updateCompany(id, dto);
  }

  @Patch('companies/:id/toggle-status')
  @UseGuards(SuperAdminGuard)
  async toggleCompanyStatus(@Param('id') id: string) {
    return this.superAdminService.toggleCompanyStatus(id);
  }

  @Get('dashboard/stats')
  @UseGuards(SuperAdminGuard)
  async getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  // Subscriptions
  @Get('subscriptions')
  @UseGuards(SuperAdminGuard)
  async listSubscriptions() {
    return this.superAdminService.listSubscriptions();
  }

  @Get('subscriptions/:id')
  @UseGuards(SuperAdminGuard)
  async getSubscription(@Param('id') id: string) {
    return this.superAdminService.getSubscriptionById(id);
  }

  // Invoices
  @Get('invoices')
  @UseGuards(SuperAdminGuard)
  async listInvoices() {
    return this.superAdminService.listInvoices();
  }

  @Post('invoices')
  @UseGuards(SuperAdminGuard)
  async createInvoice(@Body() data: any) {
    return this.superAdminService.createInvoice(data);
  }

  @Patch('invoices/:id')
  @UseGuards(SuperAdminGuard)
  async updateInvoice(@Param('id') id: string, @Body() data: any) {
    return this.superAdminService.updateInvoice(id, data);
  }
}

