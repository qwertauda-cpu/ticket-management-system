import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from '@mui/material';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';

type User = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  permissions: string[];
};

// أنواع المستخدمين
const USER_ROLES = {
  CALL_CENTER: {
    name: 'Call Center',
    nameAr: 'مركز الاتصال',
    permissions: ['tickets.read', 'tickets.create'],
  },
  TEAM_LEADER: {
    name: 'Team Leader',
    nameAr: 'قائد الفريق',
    permissions: ['tickets.read', 'tickets.create', 'tickets.update', 'tickets.assign'],
  },
  TECHNICIAN: {
    name: 'Technician',
    nameAr: 'فني',
    permissions: ['tickets.read', 'tickets.update', 'tickets.start', 'tickets.finish'],
  },
  CUSTOM: {
    name: 'Custom',
    nameAr: 'مخصص',
    permissions: [],
  },
};

// جميع الصلاحيات المتاحة
const ALL_PERMISSIONS = [
  { key: 'tickets.read', name: 'عرض التذاكر' },
  { key: 'tickets.create', name: 'إنشاء تذاكر' },
  { key: 'tickets.update', name: 'تعديل التذاكر' },
  { key: 'tickets.assign', name: 'تعيين التذاكر' },
  { key: 'tickets.start', name: 'بدء التذاكر' },
  { key: 'tickets.finish', name: 'إنهاء التذاكر' },
  { key: 'users.read', name: 'عرض المستخدمين' },
  { key: 'users.write', name: 'إدارة المستخدمين' },
];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '' });
  const [selectedRole, setSelectedRole] = useState<string>('CALL_CENTER');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل المستخدمين');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('هل أنت متأكد من تعطيل هذا المستخدم؟')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تعطيل المستخدم');
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('هل أنت متأكد من إعادة تفعيل هذا المستخدم؟')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/${userId}/reactivate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في إعادة تفعيل المستخدم');
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role !== 'CUSTOM') {
      const rolePermissions = USER_ROLES[role as keyof typeof USER_ROLES].permissions;
      setSelectedPermissions(rolePermissions);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleCreateUser = async () => {
    setCreateError('');
    
    if (!newUser.email || !newUser.password || !newUser.name) {
      setCreateError('جميع الحقول مطلوبة');
      return;
    }

    if (newUser.password.length < 8) {
      setCreateError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (selectedPermissions.length === 0) {
      setCreateError('يجب اختيار صلاحية واحدة على الأقل');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في إضافة المستخدم');
      }

      setOpenDialog(false);
      setNewUser({ email: '', password: '', name: '' });
      setSelectedRole('CALL_CENTER');
      setSelectedPermissions(USER_ROLES.CALL_CENTER.permissions);
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  // Initialize permissions when dialog opens
  useEffect(() => {
    if (openDialog) {
      setSelectedPermissions(USER_ROLES.CALL_CENTER.permissions);
    }
  }, [openDialog]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            إدارة المستخدمين
          </Typography>
          <Typography variant="body2" color="text.secondary">
            عرض وإدارة جميع المستخدمين في النظام
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          size="large"
          onClick={() => setOpenDialog(true)}
        >
          إضافة مستخدم
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>البريد الإلكتروني</TableCell>
                  <TableCell>الصلاحيات</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell align="center">الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{user.name || 'غير محدد'}</Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {user.permissions.includes('*') ? (
                          <Chip label="المالك" color="error" size="small" />
                        ) : (
                          user.permissions.map((perm) => (
                            <Chip key={perm} label={perm} size="small" />
                          ))
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'نشط' : 'معطل'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {!user.permissions.includes('*') && (
                        <>
                          {user.isActive ? (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeactivate(user.id)}
                              title="تعطيل المستخدم"
                            >
                              <PersonOffIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleReactivate(user.id)}
                              title="إعادة تفعيل المستخدم"
                            >
                              <PersonAddIcon />
                            </IconButton>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog لإضافة مستخدم */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* معلومات المستخدم */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                معلومات المستخدم
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="الاسم"
                  fullWidth
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <TextField
                  label="البريد الإلكتروني"
                  type="email"
                  fullWidth
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <TextField
                  label="كلمة المرور"
                  type="password"
                  fullWidth
                  helperText="8 أحرف على الأقل"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </Stack>
            </Box>

            <Divider />

            {/* نوع المستخدم */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                نوع المستخدم
              </Typography>
              <FormControl fullWidth>
                <InputLabel>اختر النوع</InputLabel>
                <Select
                  value={selectedRole}
                  label="اختر النوع"
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <MenuItem value="CALL_CENTER">
                    <Stack>
                      <Typography variant="body1">{USER_ROLES.CALL_CENTER.nameAr}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        عرض وإنشاء التذاكر
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="TEAM_LEADER">
                    <Stack>
                      <Typography variant="body1">{USER_ROLES.TEAM_LEADER.nameAr}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        إدارة وتعيين التذاكر
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="TECHNICIAN">
                    <Stack>
                      <Typography variant="body1">{USER_ROLES.TECHNICIAN.nameAr}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        تنفيذ وإنهاء التذاكر
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="CUSTOM">
                    <Stack>
                      <Typography variant="body1">{USER_ROLES.CUSTOM.nameAr}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        اختيار صلاحيات مخصصة
                      </Typography>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* الصلاحيات */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                الصلاحيات
              </Typography>
              <FormGroup>
                {ALL_PERMISSIONS.map((perm) => (
                  <FormControlLabel
                    key={perm.key}
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => handlePermissionToggle(perm.key)}
                        disabled={selectedRole !== 'CUSTOM'}
                      />
                    }
                    label={perm.name}
                  />
                ))}
              </FormGroup>
              {selectedRole !== 'CUSTOM' && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  * الصلاحيات محددة مسبقاً حسب نوع المستخدم. اختر "مخصص" لتعديلها.
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleCreateUser}>
            إضافة مستخدم
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

