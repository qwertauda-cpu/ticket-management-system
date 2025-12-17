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
  expiryDate?: string;
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
  tenantId: string;
  subscriptionId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidAt?: string;
}

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
}

