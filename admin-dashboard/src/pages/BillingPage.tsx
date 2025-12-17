import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Add,
  Receipt,
  AttachMoney,
  PendingActions,
  CheckCircle,
  Delete,
  Edit,
} from '@mui/icons-material';
import { api } from '../services/api';
import { Invoice, Company } from '../types';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    paymentMethod: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, companiesData, statsData] = await Promise.all([
        api.getInvoices(),
        api.getCompanies(),
        api.getInvoiceStats(),
      ]);
      setInvoices(invoicesData);
      setCompanies(companiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedCompanyId) return;

    try {
      await api.createInvoiceForTenant(selectedCompanyId);
      setCreateDialogOpen(false);
      setSelectedCompanyId('');
      loadData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('فشل في إنشاء الفاتورة');
    }
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      await api.updateInvoiceStatus(
        selectedInvoice.id,
        updateData.status,
        updateData.paymentMethod,
        updateData.notes
      );
      setUpdateDialogOpen(false);
      setSelectedInvoice(null);
      setUpdateData({ status: '', paymentMethod: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('فشل في تحديث الفاتورة');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;

    try {
      await api.deleteInvoice(invoiceId);
      loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('فشل في حذف الفاتورة');
    }
  };

  const openUpdateDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setUpdateData({
      status: invoice.status,
      paymentMethod: invoice.paymentMethod || '',
      notes: invoice.notes || '',
    });
    setUpdateDialogOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'invoiceNumber',
      headerName: 'رقم الفاتورة',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography fontWeight="bold" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'companyName',
      headerName: 'الشركة',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'amount',
      headerName: 'المبلغ',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography fontWeight="bold" color="success.main">
          {params.value.toLocaleString()} د.ع
        </Typography>
      ),
    },
    {
      field: 'userCount',
      headerName: 'عدد الموظفين',
      flex: 0.7,
      minWidth: 100,
    },
    {
      field: 'status',
      headerName: 'الحالة',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => {
        const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          Paid: 'success',
          Unpaid: 'warning',
          Overdue: 'error',
          Cancelled: 'default',
        };
        const statusLabels: Record<string, string> = {
          Paid: 'مدفوعة',
          Unpaid: 'غير مدفوعة',
          Overdue: 'متأخرة',
          Cancelled: 'ملغاة',
        };
        return (
          <Chip
            label={statusLabels[params.value] || params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        );
      },
    },
    {
      field: 'dueDate',
      headerName: 'تاريخ الاستحقاق',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>
          {new Date(params.value).toLocaleDateString('ar-IQ')}
        </Typography>
      ),
    },
    {
      field: 'paidAt',
      headerName: 'تاريخ الدفع',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>
          {params.value ? new Date(params.value).toLocaleDateString('ar-IQ') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="تعديل">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openUpdateDialog(params.row as Invoice)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteInvoice(params.row.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            إدارة الفواتير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إنشاء وإدارة فواتير الشركات
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 3,
            py: 1.5,
          }}
        >
          إنشاء فاتورة جديدة
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color="white" fontWeight="bold">
                      {stats.totalInvoices}
                    </Typography>
                    <Typography variant="body2" color="white">
                      إجمالي الفواتير
                    </Typography>
                  </Box>
                  <Receipt sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color="white" fontWeight="bold">
                      {stats.unpaidInvoices}
                    </Typography>
                    <Typography variant="body2" color="white">
                      فواتير غير مدفوعة
                    </Typography>
                  </Box>
                  <PendingActions sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color="white" fontWeight="bold">
                      {stats.paidInvoices}
                    </Typography>
                    <Typography variant="body2" color="white">
                      فواتير مدفوعة
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color="white" fontWeight="bold">
                      {stats.totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="white">
                      إجمالي الإيرادات (د.ع)
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Invoices Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={invoices}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>

      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          إنشاء فاتورة جديدة
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="اختر الشركة"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            sx={{ mt: 2 }}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.companyName} ({company.ownerName})
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            سيتم حساب المبلغ تلقائياً بناءً على عدد الموظفين وسعر الموظف الواحد.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>إلغاء</Button>
          <Button
            onClick={handleCreateInvoice}
            variant="contained"
            disabled={!selectedCompanyId}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            إنشاء
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Invoice Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          تحديث الفاتورة
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="الحالة"
            value={updateData.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Unpaid">غير مدفوعة</MenuItem>
            <MenuItem value="Paid">مدفوعة</MenuItem>
            <MenuItem value="Overdue">متأخرة</MenuItem>
            <MenuItem value="Cancelled">ملغاة</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="طريقة الدفع"
            value={updateData.paymentMethod}
            onChange={(e) => setUpdateData({ ...updateData, paymentMethod: e.target.value })}
            sx={{ mt: 2 }}
            placeholder="نقداً، تحويل بنكي، إلخ..."
          />

          <TextField
            fullWidth
            label="ملاحظات"
            value={updateData.notes}
            onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>إلغاء</Button>
          <Button
            onClick={handleUpdateInvoice}
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            تحديث
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

