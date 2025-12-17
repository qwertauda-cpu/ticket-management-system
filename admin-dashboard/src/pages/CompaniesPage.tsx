import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, ToggleOff, ToggleOn, Delete } from '@mui/icons-material';
import { api } from '../services/api';
import type { Company } from '../types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (error) {
      showSnackbar('فشل في جلب الشركات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreate = async () => {
    try {
      await api.createCompany(formData);
      showSnackbar('تم إنشاء الشركة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
      loadCompanies();
    } catch (error: any) {
      showSnackbar(error.message || 'فشل في إنشاء الشركة', 'error');
    }
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      companyName: company.companyName,
      ownerName: company.ownerName,
      ownerEmail: company.ownerEmail,
      ownerPassword: '',
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCompany) return;
    try {
      await api.updateCompany(selectedCompany.id, formData);
      showSnackbar('تم تحديث الشركة بنجاح', 'success');
      setDialogOpen(false);
      resetForm();
      loadCompanies();
    } catch (error: any) {
      showSnackbar(error.message || 'فشل في تحديث الشركة', 'error');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleCompanyStatus(id);
      showSnackbar('تم تغيير حالة الشركة بنجاح', 'success');
      loadCompanies();
    } catch (error: any) {
      showSnackbar(error.message || 'فشل في تغيير حالة الشركة', 'error');
    }
  };

  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`هل أنت متأكد من حذف شركة "${companyName}"؟\n\nسيتم حذف جميع البيانات المرتبطة بها!`)) {
      return;
    }
    try {
      await api.deleteCompany(id);
      showSnackbar('تم حذف الشركة بنجاح', 'success');
      loadCompanies();
    } catch (error: any) {
      showSnackbar(error.message || 'فشل في حذف الشركة', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ companyName: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
    setSelectedCompany(null);
    setEditMode(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setDetailsDialogOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'companyName',
      headerName: 'اسم الشركة',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography 
          fontWeight="bold" 
          sx={{ 
            cursor: 'pointer', 
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleViewDetails(params.row)}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: 'ownerName', headerName: 'اسم المالك', flex: 1, minWidth: 150 },
    { field: 'ownerEmail', headerName: 'البريد الإلكتروني', flex: 1, minWidth: 220 },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'نشط' : 'معطل'}
          color={params.value ? 'success' : 'error'}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('ar-EG'),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="تعديل"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color={params.row.isActive ? 'warning' : 'success'}
            onClick={() => handleToggleStatus(params.row.id)}
            title={params.row.isActive ? 'تعطيل' : 'تفعيل'}
          >
            {params.row.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id, params.row.companyName)}
            title="حذف"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box flex={1}>
          <Typography variant="h4" fontWeight="bold">
            إدارة الشركات
          </Typography>
          <Typography variant="body2" color="text.secondary">
            عرض وإدارة جميع الشركات المسجلة في المنصة
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          إضافة شركة جديدة
        </Button>
      </Box>

      <Paper elevation={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          rows={companies}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e0e0e0',
              fontSize: '0.95rem',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8f9ff',
            },
          }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          {editMode ? 'تعديل الشركة' : 'إضافة شركة جديدة'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="اسم الشركة *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="اسم المالك *"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="البريد الإلكتروني *"
            type="email"
            value={formData.ownerEmail}
            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
            sx={{ mb: 2 }}
            required
            disabled={editMode}
          />
          <TextField
            fullWidth
            label={editMode ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء على القديمة)' : 'كلمة المرور *'}
            type="password"
            value={formData.ownerPassword}
            onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
            required={!editMode}
            helperText={editMode ? 'اترك هذا الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleDialogClose} variant="outlined" size="large">
            إلغاء
          </Button>
          <Button
            onClick={editMode ? handleUpdate : handleCreate}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minWidth: 120,
            }}
          >
            {editMode ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة تفاصيل الشركة */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        dir="rtl"
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          تفاصيل الشركة
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedCompany && (
            <Box>
              {/* معلومات الشركة */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  📋 معلومات الشركة
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">اسم الشركة</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedCompany.companyName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">الحالة</Typography>
                    <Chip 
                      label={selectedCompany.isActive ? 'نشط' : 'معطل'} 
                      color={selectedCompany.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 'bold', mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">تاريخ الإنشاء</Typography>
                    <Typography variant="body1">
                      {new Date(selectedCompany.createdAt).toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">معرّف الشركة</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {selectedCompany.id}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* معلومات المالك */}
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  👤 معلومات المالك
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">الاسم</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedCompany.ownerName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">البريد الإلكتروني</Typography>
                    <Typography variant="body1">{selectedCompany.ownerEmail}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* معلومات الاشتراك */}
              <Paper elevation={2} sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  💳 معلومات الاشتراك
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">نوع الاشتراك</Typography>
                    <Chip 
                      label={selectedCompany.subscriptionPlan || 'Basic'} 
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold', mt: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">حالة الاشتراك</Typography>
                    <Chip 
                      label={selectedCompany.subscriptionStatus || 'Active'} 
                      color={selectedCompany.subscriptionStatus === 'Active' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 'bold', mt: 0.5 }}
                    />
                  </Box>
                  {selectedCompany.expiryDate && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">تاريخ الانتهاء</Typography>
                      <Typography variant="body1">
                        {new Date(selectedCompany.expiryDate).toLocaleDateString('ar-EG')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDetailsDialogOpen(false)} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
