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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Company = {
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
};

export function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Create Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    companyName: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
    subscriptionPlan: 'Basic',
    maxUsers: 10,
    maxTickets: 1000,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    subscriptionPlan: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    maxUsers: 0,
    maxTickets: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPlan !== 'All') {
      filtered = filtered.filter(c => c.subscriptionPlan === filterPlan);
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(c => 
        filterStatus === 'Active' ? c.isActive : !c.isActive
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, filterPlan, filterStatus]);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    setCreateLoading(true);
    setCreateError('');

    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch('http://localhost:3000/super-admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create company');
      }

      await fetchCompanies();
      setOpenCreateDialog(false);
      setCreateFormData({
        companyName: '',
        adminEmail: '',
        adminPassword: '',
        adminName: '',
        subscriptionPlan: 'Basic',
        maxUsers: 10,
        maxTickets: 1000,
      });
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany) return;

    setEditLoading(true);
    setEditError('');

    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`http://localhost:3000/super-admin/companies/${editingCompany.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update company');
      }

      await fetchCompanies();
      setOpenEditDialog(false);
      setEditingCompany(null);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`http://localhost:3000/super-admin/companies/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }

      await fetchCompanies();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditDialogForCompany = (company: Company) => {
    setEditingCompany(company);
    setEditFormData({
      companyName: company.companyName,
      subscriptionPlan: company.subscriptionPlan,
      subscriptionStartDate: company.subscriptionStartDate ? company.subscriptionStartDate.split('T')[0] : '',
      subscriptionEndDate: company.subscriptionEndDate ? company.subscriptionEndDate.split('T')[0] : '',
      maxUsers: company.maxUsers,
      maxTickets: company.maxTickets,
    });
    setEditError('');
    setOpenEditDialog(true);
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
            إدارة الشركات
          </Typography>
          <Typography variant="body2" color="text.secondary">
            جميع الشركات المستأجرة للمنصة
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{ borderRadius: 3, px: 3, py: 1.5, boxShadow: 3 }}
        >
          إضافة شركة جديدة
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Search & Filter */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="بحث بالاسم"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 2 }}
          />
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>الخطة</InputLabel>
            <Select
              value={filterPlan}
              label="الخطة"
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <MenuItem value="All">الكل</MenuItem>
              <MenuItem value="Basic">Basic</MenuItem>
              <MenuItem value="Pro">Pro</MenuItem>
              <MenuItem value="Enterprise">Enterprise</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={filterStatus}
              label="الحالة"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="All">الكل</MenuItem>
              <MenuItem value="Active">نشط</MenuItem>
              <MenuItem value="Inactive">معطل</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Companies Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>اسم الشركة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الخطة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>المستخدمين</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>التذاكر</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ الإنشاء</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      لا توجد شركات
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {company.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.subscriptionPlan}
                        size="small"
                        color={
                          company.subscriptionPlan === 'Enterprise'
                            ? 'error'
                            : company.subscriptionPlan === 'Pro'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.isActive ? 'نشط' : 'معطل'}
                        size="small"
                        color={company.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{company.userCount}</TableCell>
                    <TableCell>{company.ticketCount}</TableCell>
                    <TableCell>
                      {new Date(company.createdAt).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => {
                              window.history.pushState({}, '', `/super-admin/companies/${company.id}`);
                              window.location.reload();
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialogForCompany(company)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={company.isActive ? 'تعطيل' : 'تفعيل'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(company.id)}
                          >
                            {company.isActive ? (
                              <ToggleOnIcon color="success" />
                            ) : (
                              <ToggleOffIcon color="error" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Company Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة شركة جديدة</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createError && <Alert severity="error">{createError}</Alert>}
            <TextField
              label="اسم الشركة"
              fullWidth
              value={createFormData.companyName}
              onChange={(e) => setCreateFormData({ ...createFormData, companyName: e.target.value })}
              required
            />
            <TextField
              label="بريد المدير الإلكتروني"
              fullWidth
              type="email"
              value={createFormData.adminEmail}
              onChange={(e) => setCreateFormData({ ...createFormData, adminEmail: e.target.value })}
              required
            />
            <TextField
              label="كلمة مرور المدير"
              fullWidth
              type="password"
              value={createFormData.adminPassword}
              onChange={(e) => setCreateFormData({ ...createFormData, adminPassword: e.target.value })}
              required
            />
            <TextField
              label="اسم المدير"
              fullWidth
              value={createFormData.adminName}
              onChange={(e) => setCreateFormData({ ...createFormData, adminName: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>خطة الاشتراك</InputLabel>
              <Select
                value={createFormData.subscriptionPlan}
                label="خطة الاشتراك"
                onChange={(e) => setCreateFormData({ ...createFormData, subscriptionPlan: e.target.value })}
              >
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Pro">Pro</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="الحد الأقصى للمستخدمين"
              fullWidth
              type="number"
              value={createFormData.maxUsers}
              onChange={(e) => setCreateFormData({ ...createFormData, maxUsers: parseInt(e.target.value) })}
            />
            <TextField
              label="الحد الأقصى للتذاكر"
              fullWidth
              type="number"
              value={createFormData.maxTickets}
              onChange={(e) => setCreateFormData({ ...createFormData, maxTickets: parseInt(e.target.value) })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} disabled={createLoading}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleCreateCompany} disabled={createLoading}>
            {createLoading ? <CircularProgress size={24} /> : 'إنشاء الشركة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل الشركة: {editingCompany?.companyName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editError && <Alert severity="error">{editError}</Alert>}
            <TextField
              label="اسم الشركة"
              fullWidth
              value={editFormData.companyName}
              onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>خطة الاشتراك</InputLabel>
              <Select
                value={editFormData.subscriptionPlan}
                label="خطة الاشتراك"
                onChange={(e) => setEditFormData({ ...editFormData, subscriptionPlan: e.target.value })}
              >
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Pro">Pro</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="تاريخ بداية الاشتراك"
              fullWidth
              type="date"
              value={editFormData.subscriptionStartDate}
              onChange={(e) => setEditFormData({ ...editFormData, subscriptionStartDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="تاريخ نهاية الاشتراك"
              fullWidth
              type="date"
              value={editFormData.subscriptionEndDate}
              onChange={(e) => setEditFormData({ ...editFormData, subscriptionEndDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="الحد الأقصى للمستخدمين"
              fullWidth
              type="number"
              value={editFormData.maxUsers}
              onChange={(e) => setEditFormData({ ...editFormData, maxUsers: parseInt(e.target.value) })}
            />
            <TextField
              label="الحد الأقصى للتذاكر"
              fullWidth
              type="number"
              value={editFormData.maxTickets}
              onChange={(e) => setEditFormData({ ...editFormData, maxTickets: parseInt(e.target.value) })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={editLoading}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleEditCompany} disabled={editLoading}>
            {editLoading ? <CircularProgress size={24} /> : 'حفظ التعديلات'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
