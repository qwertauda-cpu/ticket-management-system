const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : `http://${window.location.hostname}/api`;

class ApiService {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/super-admin/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('فشل تسجيل الدخول');
    }

    const data = await response.json();
    localStorage.setItem('adminToken', data.accessToken);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    return data;
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  getUser() {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Companies
  async getCompanies() {
    const response = await fetch(`${API_URL}/super-admin/companies`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الشركات');
    }

    return response.json();
  }

  async createCompany(data: {
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    maxUsers?: number;
    pricePerUser?: number;
  }) {
    const response = await fetch(`${API_URL}/super-admin/companies`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        companyName: data.companyName,
        adminName: data.ownerName,
        adminEmail: data.ownerEmail,
        adminPassword: data.ownerPassword,
        maxUsers: data.maxUsers || 10,
        pricePerUser: data.pricePerUser || 10000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'فشل في إنشاء الشركة');
    }

    return response.json();
  }

  async updateCompany(id: string, data: {
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword?: string;
    maxUsers?: number;
    pricePerUser?: number;
  }) {
    const payload: any = {
      companyName: data.companyName,
      adminName: data.ownerName,
      adminEmail: data.ownerEmail,
    };
    
    if (data.ownerPassword) {
      payload.adminPassword = data.ownerPassword;
    }
    
    if (data.maxUsers !== undefined) {
      payload.maxUsers = data.maxUsers;
    }
    
    if (data.pricePerUser !== undefined) {
      payload.pricePerUser = data.pricePerUser;
    }
    
    const response = await fetch(`${API_URL}/super-admin/companies/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'فشل في تحديث الشركة');
    }

    return response.json();
  }

  async toggleCompanyStatus(id: string) {
    const response = await fetch(`${API_URL}/super-admin/companies/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في تغيير حالة الشركة');
    }

    return response.json();
  }

  async deleteCompany(id: string) {
    const response = await fetch(`${API_URL}/super-admin/companies/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في حذف الشركة');
    }

    return response.json();
  }

  // Dashboard Stats
  async getDashboardStats() {
    const response = await fetch(`${API_URL}/super-admin/dashboard/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الإحصائيات');
    }

    return response.json();
  }

  // Subscriptions
  async getSubscriptions() {
    const response = await fetch(`${API_URL}/super-admin/subscriptions`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الاشتراكات');
    }

    return response.json();
  }

  // Invoices
  async getInvoices() {
    const response = await fetch(`${API_URL}/super-admin/billing/invoices`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في جلب الفواتير');
    }

    return response.json();
  }

  async createInvoiceForTenant(tenantId: string) {
    const response = await fetch(`${API_URL}/super-admin/billing/invoices/tenant/${tenantId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في إنشاء الفاتورة');
    }

    return response.json();
  }

  async updateInvoiceStatus(
    invoiceId: string,
    status: string,
    paymentMethod?: string,
    notes?: string
  ) {
    const response = await fetch(`${API_URL}/super-admin/billing/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, paymentMethod, notes }),
    });

    if (!response.ok) {
      throw new Error('فشل في تحديث حالة الفاتورة');
    }

    return response.json();
  }

  async deleteInvoice(invoiceId: string) {
    const response = await fetch(`${API_URL}/super-admin/billing/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في حذف الفاتورة');
    }

    return response.json();
  }

  async getInvoiceStats() {
    const response = await fetch(`${API_URL}/super-admin/billing/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل في جلب إحصائيات الفواتير');
    }

    return response.json();
  }
}

export const api = new ApiService();

