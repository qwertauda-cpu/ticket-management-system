import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface CompanyDetails {
  id: string;
  companyName: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  maxUsers: number;
  maxTickets: number;
  isActive: boolean;
  userCount: number;
  ticketCount: number;
  createdAt: string;
  subscriptions: any[];
  invoices: any[];
}

export function SuperAdminCompanyDetailsPage() {
  const id = window.location.pathname.split('/').pop();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`http://localhost:3000/super-admin/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load company details');
      }

      const data = await response.json();
      setCompany(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Company not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            window.history.pushState({}, '', '/super-admin/companies');
            window.location.reload();
          }}
          sx={{ mt: 2 }}
        >
          العودة للشركات
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          window.history.pushState({}, '', '/super-admin/companies');
          window.location.reload();
        }}
        sx={{ mb: 3 }}
      >
        العودة للشركات
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
        تفاصيل الشركة: {company.companyName}
      </Typography>

      {/* Company Info Card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            معلومات الشركة
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                اسم الشركة
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {company.companyName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                خطة الاشتراك
              </Typography>
              <Chip
                label={company.subscriptionPlan}
                color={
                  company.subscriptionPlan === 'Enterprise'
                    ? 'error'
                    : company.subscriptionPlan === 'Pro'
                    ? 'warning'
                    : 'default'
                }
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                الحالة
              </Typography>
              <Chip
                label={company.isActive ? 'نشط' : 'معطل'}
                color={company.isActive ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                حالة الاشتراك
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {company.subscriptionStatus}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                تاريخ بداية الاشتراك
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {company.subscriptionStartDate
                  ? new Date(company.subscriptionStartDate).toLocaleDateString('ar-EG')
                  : 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                تاريخ نهاية الاشتراك
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {company.subscriptionEndDate
                  ? new Date(company.subscriptionEndDate).toLocaleDateString('ar-EG')
                  : 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                المستخدمون
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {company.userCount} / {company.maxUsers}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                التذاكر
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {company.ticketCount} / {company.maxTickets}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                تاريخ الإنشاء
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(company.createdAt).toLocaleDateString('ar-EG')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="الاشتراكات" />
          <Tab label="الفواتير" />
        </Tabs>

        {/* Subscriptions Tab */}
        {currentTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              سجل الاشتراكات
            </Typography>
            {company.subscriptions && company.subscriptions.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>الخطة</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>السعر</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>تاريخ البداية</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>تاريخ النهاية</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {company.subscriptions.map((sub: any) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.planName}</TableCell>
                        <TableCell>{sub.price} $</TableCell>
                        <TableCell>{new Date(sub.startDate).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>{new Date(sub.endDate).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>
                          <Chip label={sub.status} size="small" color={sub.status === 'Active' ? 'success' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">لا توجد اشتراكات</Alert>
            )}
          </Box>
        )}

        {/* Invoices Tab */}
        {currentTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              سجل الفواتير
            </Typography>
            {company.invoices && company.invoices.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>المبلغ</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>تاريخ الاستحقاق</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>تاريخ الدفع</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {company.invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.amount} $</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            size="small"
                            color={invoice.status === 'Paid' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>
                          {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('ar-EG') : 'لم يتم الدفع'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">لا توجد فواتير</Alert>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}

