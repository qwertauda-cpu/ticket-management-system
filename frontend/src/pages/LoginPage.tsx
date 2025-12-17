import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

type Props = {
  onLogin: (token: string, user: any) => void;
  onSuperAdminLogin?: (token: string, user: any) => void;
};

export function LoginPage({ onLogin, onSuperAdminLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if this is a super admin login
      if (isSuperAdminMode) {
        const response = await fetch('http://localhost:3000/super-admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        const data = await response.json();
        if (onSuperAdminLogin) {
          onSuperAdminLogin(data.accessToken, data.user);
        }
      } else {
        // Regular user login
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        const data = await response.json();
        onLogin(data.accessToken, data.user);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  background: isSuperAdminMode
                    ? 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '2.5rem',
                  mb: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                {isSuperAdminMode ? 'S' : 'T'}
              </Box>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                تسجيل الدخول
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSuperAdminMode ? 'دخول المدير العام' : 'نظام إدارة التذاكر'}
              </Typography>
            </Box>

            {/* Error */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="البريد الإلكتروني"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="كلمة المرور"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
                </Button>
              </Stack>
            </form>

            {/* Super Admin Toggle */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setIsSuperAdminMode(!isSuperAdminMode);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                sx={{ 
                  textDecoration: 'none',
                  color: isSuperAdminMode ? 'error.main' : 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {isSuperAdminMode ? '← الرجوع لتسجيل دخول المستخدمين' : 'دخول المدير العام →'}
              </Button>
            </Box>

            {/* Demo Accounts */}
            {!isSuperAdminMode && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} display="block" gutterBottom>
                  حسابات تجريبية:
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  <strong>المالك:</strong> owner@demo.com / password123
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  <strong>كول سنتر:</strong> callcenter@demo.com / password123
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>الفني:</strong> tech1@demo.com / password123
                </Typography>
              </Box>
            )}

            {isSuperAdminMode && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'error.50', borderRadius: 2, border: '1px solid', borderColor: 'error.200' }}>
                <Typography variant="caption" fontWeight={700} display="block" gutterBottom color="error.main">
                  🔐 حساب المدير العام:
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>البريد:</strong> superadmin@example.com
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>كلمة المرور:</strong> superadmin123
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
