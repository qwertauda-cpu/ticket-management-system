import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type Stats = {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalTickets: number;
  recentCompanies: Array<{
    id: string;
    companyName: string;
    subscriptionPlan: string;
    createdAt: string;
  }>;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: `${color}.50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch('http://localhost:3000/super-admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data);
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          لوحة التحكم - Super Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          نظرة عامة على جميع الشركات والمستخدمين
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard
          title="إجمالي الشركات"
          value={stats.totalCompanies}
          icon={<BusinessIcon sx={{ fontSize: 32 }} />}
          color="primary"
        />
        <StatCard
          title="الشركات النشطة"
          value={stats.activeCompanies}
          icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
          color="success"
        />
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers}
          icon={<PeopleIcon sx={{ fontSize: 32 }} />}
          color="info"
        />
        <StatCard
          title="إجمالي التذاكر"
          value={stats.totalTickets}
          icon={<ConfirmationNumberIcon sx={{ fontSize: 32 }} />}
          color="warning"
        />
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            آخر الشركات المضافة
          </Typography>
          <Stack spacing={2}>
            {stats.recentCompanies.map((company) => (
              <Box
                key={company.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {company.companyName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(company.createdAt).toLocaleDateString('ar-EG')}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  {company.subscriptionPlan}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

