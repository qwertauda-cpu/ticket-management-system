import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  tenant: {
    id: string;
    companyName: string;
  };
}

export function SuperAdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    tenantId: '',
    amount: 0,
    status: 'Pending',
    dueDate: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchCompanies();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch('http://localhost:3000/super-admin/invoices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load invoices');
      }

      const data = await response.json();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch('http://localhost:3000/super-admin/companies', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load companies');
      }

      const data = await response.json();
      setCompanies(data);
    } catch (err: any) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleCreateInvoice = async () => {
    setCreateLoading(true);
    setCreateError('');

    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch('http://localhost:3000/super-admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      await fetchInvoices();
      setOpenCreateDialog(false);
      setCreateFormData({
        tenantId: '',
        amount: 0,
        status: 'Pending',
        dueDate: '',
      });
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`http://localhost:3000/super-admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Paid',
          paidAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      await fetchInvoices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          إدارة الفواتير
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{ borderRadius: 3, px: 3, py: 1.5, boxShadow: 3 }}
        >
          إضافة فاتورة جديدة
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>الشركة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>المبلغ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ الاستحقاق</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ الدفع</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ الإنشاء</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      لا توجد فواتير
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {invoice.tenant.companyName}
                      </Typography>
                    </TableCell>
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
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>
                      {invoice.status !== 'Paid' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                        >
                          تحديد كمدفوع
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createError && <Alert severity="error">{createError}</Alert>}
            <FormControl fullWidth>
              <InputLabel>الشركة</InputLabel>
              <Select
                value={createFormData.tenantId}
                label="الشركة"
                onChange={(e) => setCreateFormData({ ...createFormData, tenantId: e.target.value })}
                required
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="المبلغ ($)"
              fullWidth
              type="number"
              value={createFormData.amount}
              onChange={(e) => setCreateFormData({ ...createFormData, amount: parseFloat(e.target.value) })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={createFormData.status}
                label="الحالة"
                onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
              >
                <MenuItem value="Pending">معلقة</MenuItem>
                <MenuItem value="Paid">مدفوعة</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="تاريخ الاستحقاق"
              fullWidth
              type="date"
              value={createFormData.dueDate}
              onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} disabled={createLoading}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleCreateInvoice} disabled={createLoading}>
            {createLoading ? <CircularProgress size={24} /> : 'إنشاء الفاتورة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

