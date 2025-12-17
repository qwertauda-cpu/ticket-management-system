import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Skeleton,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CallIcon from '@mui/icons-material/Call';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dayjs from 'dayjs';
import { listTickets, type TicketCard, type ListTicketsResponse } from '../api/tickets';
import { StatusChip } from '../components/ticketStatus';
import { CreateTicketDialog } from '../components/CreateTicketDialog';
import { AdvancedFiltersDialog, type AdvancedFilters } from '../components/AdvancedFiltersDialog';
import { canCreateTicket } from '../utils/permissions';

const STATUS_OPTIONS = ['OPEN', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'WAITING', 'ON_HOLD', 'DONE'] as const;

interface TicketsPageProps {
  onViewTicket?: (ticketId: string) => void;
}

export function TicketsPage({ onViewTicket }: TicketsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [slaFilter, setSlaFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

  const [list, setList] = useState<ListTicketsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Get user from localStorage
  const user = useMemo(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  const queryParams = useMemo(() => {
    return {
      page,
      pageSize,
      status: advancedFilters.status?.length ? advancedFilters.status : (statusFilter ? [statusFilter] : undefined),
      nationalSla: advancedFilters.nationalSla !== undefined ? advancedFilters.nationalSla : (slaFilter === 'sla' ? true : undefined),
      q: searchQuery.trim() ? searchQuery.trim() : undefined,
      dateFrom: advancedFilters.dateFrom,
      dateTo: advancedFilters.dateTo,
      zone: advancedFilters.zone,
      ticketType: advancedFilters.ticketType,
      priority: advancedFilters.priority,
    };
  }, [page, pageSize, statusFilter, slaFilter, searchQuery, advancedFilters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTickets(queryParams)
      .then((res) => {
        if (cancelled) return;
        setList(res);
      })
      .catch((err) => {
        console.error('Failed to load tickets:', err);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, slaFilter, searchQuery]);

  const totalPages = useMemo(() => {
    const total = list?.total ?? 0;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [list?.total, pageSize]);

  const items: TicketCard[] = list?.items ?? [];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
            التذاكر
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة ومتابعة جميع التذاكر
          </Typography>
        </Box>
        {canCreateTicket(user) && (
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              boxShadow: 3,
            }}
          >
            تذكرة جديدة
          </Button>
        )}
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr 1.5fr 1.5fr 1fr' }, gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="بحث برقم التذكرة أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                label="الحالة"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">الكل</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>النوع</InputLabel>
              <Select
                value={slaFilter}
                label="النوع"
                onChange={(e) => setSlaFilter(e.target.value)}
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="sla">SLA وطني فقط</MenuItem>
                <MenuItem value="regular">عادي فقط</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setAdvancedFiltersOpen(true)}
              sx={{ height: 56 }}
            >
              فلاتر متقدمة
              {Object.keys(advancedFilters).filter(k => advancedFilters[k as keyof AdvancedFilters] !== undefined).length > 0 && (
                <Chip 
                  label={Object.keys(advancedFilters).filter(k => advancedFilters[k as keyof AdvancedFilters] !== undefined).length} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Skeleton width="60%" height={32} />
                    <Skeleton width={80} height={32} />
                  </Stack>
                  <Skeleton width="100%" height={20} />
                  <Skeleton width="80%" height={20} />
                  <Skeleton width="90%" height={20} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : items.length === 0 ? (
        <Card>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
              }}
            >
              <SearchIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              لا توجد تذاكر
            </Typography>
            <Typography variant="body2" color="text.secondary">
              لم يتم العثور على تذاكر تطابق معايير البحث
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {items.map((ticket) => (
              <Box key={ticket.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {ticket.ticketType}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: 0.3,
                              fontSize: '1.1rem',
                            }}
                            noWrap
                          >
                            {ticket.ticketNumber}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          {ticket.nationalSla && (
                            <Chip
                              size="small"
                              label="SLA"
                              color="error"
                              icon={<WarningAmberIcon fontSize="small" />}
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                        </Stack>
                      </Stack>

                      {/* Status */}
                      <Box>
                        <StatusChip status={String(ticket.status)} />
                      </Box>

                      {/* Details */}
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <CallIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {ticket.phone}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <PlaceIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {ticket.zone}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(ticket.createdAt).format('YYYY-MM-DD HH:mm')}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          sx={{ flex: 1 }}
                          onClick={() => onViewTicket?.(ticket.id)}
                        >
                          عرض
                        </Button>
                        <Tooltip title="اتصال سريع">
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <CallIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              عرض {items.length} من {list?.total ?? 0} تذكرة
            </Typography>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_, p) => setPage(p)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Stack>
        </>
      )}

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          // Reload tickets after creating
          setLoading(true);
          listTickets(queryParams)
            .then((data) => setList(data))
            .catch((err) => console.error('Failed to reload tickets:', err))
            .finally(() => setLoading(false));
        }}
      />

      {/* Advanced Filters Dialog */}
      <AdvancedFiltersDialog
        open={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setPage(1); // Reset to first page when filters change
        }}
        currentFilters={advancedFilters}
      />
    </Box>
  );
}

