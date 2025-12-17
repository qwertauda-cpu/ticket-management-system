import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  Business,
  CheckCircle,
  Cancel,
  AttachMoney,
  Receipt,
} from '@mui/icons-material';
import { api } from '../services/api';
import type { DashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 32, color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        لوحة المعلومات
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        نظرة عامة على إحصائيات المنصة
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الشركات"
            value={stats?.totalCompanies || 0}
            icon={Business}
            color="#667eea"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="الشركات النشطة"
            value={stats?.activeCompanies || 0}
            icon={CheckCircle}
            color="#48bb78"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="الشركات المعطلة"
            value={stats?.inactiveCompanies || 0}
            icon={Cancel}
            color="#f56565"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="الفواتير المعلقة"
            value={stats?.pendingInvoices || 0}
            icon={Receipt}
            color="#ed8936"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    backgroundColor: '#48bb7820',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoney sx={{ fontSize: 32, color: '#48bb78' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    الإيرادات الشهرية
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#48bb78">
                    ${(stats?.monthlyRevenue || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    backgroundColor: '#667eea20',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoney sx={{ fontSize: 32, color: '#667eea' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#667eea">
                    ${(stats?.totalRevenue || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

