import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useState } from 'react';
import { getTicketsSummary, type TicketsSummaryResponse } from '../api/tickets';

type StatCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
};

function StatCard({ title, value, change, icon, color, loading }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 56,
                height: 56,
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
            {change !== undefined && (
              <Chip
                size="small"
                icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${isPositive ? '+' : ''}${change}%`}
                color={isPositive ? 'success' : 'error'}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {loading ? (
              <LinearProgress sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

type RecentTicket = {
  id: string;
  number: string;
  status: string;
  customer: string;
  time: string;
};

const recentTickets: RecentTicket[] = [
  { id: '1', number: 'FTK-2024-000123', status: 'قيد التنفيذ', customer: 'أحمد علي', time: 'منذ 5 دقائق' },
  { id: '2', number: 'FTK-2024-000122', status: 'مسندة', customer: 'فاطمة محمد', time: 'منذ 15 دقيقة' },
  { id: '3', number: 'FTK-2024-000121', status: 'منتهية', customer: 'خالد سعيد', time: 'منذ ساعة' },
  { id: '4', number: 'FTK-2024-000120', status: 'معلقة', customer: 'نورة أحمد', time: 'منذ ساعتين' },
];

const statusColors: Record<string, string> = {
  'قيد التنفيذ': 'success',
  'مسندة': 'primary',
  'منتهية': 'info',
  'معلقة': 'warning',
};

export function Dashboard() {
  const [summary, setSummary] = useState<TicketsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTicketsSummary()
      .then((res) => {
        if (cancelled) return;
        setSummary(res);
      })
      .catch((err) => {
        console.error('Failed to load summary:', err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalTickets = summary?.total ?? 0;
  const openTickets = summary?.byStatus?.OPEN ?? 0;
  const inProgressTickets = summary?.byStatus?.IN_PROGRESS ?? 0;
  const doneTickets = summary?.byStatus?.DONE ?? 0;
  const slaTickets = summary?.nationalSla ?? 0;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          مرحباً بك 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إليك ملخص سريع لأداء اليوم
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard
          title="إجمالي التذاكر"
          value={totalTickets}
          change={12}
          icon={<ConfirmationNumberIcon sx={{ fontSize: 28 }} />}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="قيد التنفيذ"
          value={inProgressTickets}
          change={8}
          icon={<PendingIcon sx={{ fontSize: 28 }} />}
          color="success"
          loading={loading}
        />
        <StatCard
          title="منتهية اليوم"
          value={doneTickets}
          change={-3}
          icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
          color="info"
          loading={loading}
        />
        <StatCard
          title="SLA وطني"
          value={slaTickets}
          icon={<WarningAmberIcon sx={{ fontSize: 28 }} />}
          color="error"
          loading={loading}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Tickets */}
        <Box>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  التذاكر الأخيرة
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Stack>

              <Stack spacing={2}>
                {recentTickets.map((ticket) => (
                  <Box
                    key={ticket.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(-4px)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 44,
                          height: 44,
                          fontWeight: 700,
                        }}
                      >
                        {ticket.customer[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {ticket.number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {ticket.customer} • {ticket.time}
                        </Typography>
                      </Box>
                      <Chip
                        label={ticket.status}
                        color={statusColors[ticket.status] as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Stats */}
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                إحصائيات سريعة
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      معدل الإنجاز
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      85%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      رضا العملاء
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      92%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    color="success"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      متوسط وقت الاستجابة
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      12 دقيقة
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={70}
                    color="warning"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'success.50',
                    border: '1px solid',
                    borderColor: 'success.200',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon color="success" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        أداء ممتاز!
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        أنت تتفوق على المعدل الشهري
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

