export interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
}

export interface Company {
  id: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  isActive: boolean;
  createdAt: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  maxUsers?: number;
  maxTickets?: number;
  pricePerUser?: number;
  userCount?: number;
  ticketCount?: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  amount: number;
  userCount: number;
  description?: string;
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
}

