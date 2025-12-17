import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';

interface Subscription {
  id: string;
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  tenant: {
    id: string;
    companyName: string;
  };
}

export function SuperAdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch('http://localhost:3000/super-admin/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data);
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

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
        إدارة الاشتراكات
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>الشركة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الخطة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>السعر</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ البداية</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ النهاية</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>تاريخ الإنشاء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      لا توجد اشتراكات
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sub.tenant.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.planName}
                        size="small"
                        color={
                          sub.planName === 'Enterprise'
                            ? 'error'
                            : sub.planName === 'Pro'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{sub.price} $</TableCell>
                    <TableCell>{new Date(sub.startDate).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>{new Date(sub.endDate).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>
                      <Chip
                        label={sub.status}
                        size="small"
                        color={sub.status === 'Active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{new Date(sub.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

