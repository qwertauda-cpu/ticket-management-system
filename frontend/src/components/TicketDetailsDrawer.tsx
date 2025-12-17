import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CallIcon from '@mui/icons-material/Call';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import dayjs from 'dayjs';
import {
  getTicketDetails,
  getTicketTimeline,
  startTicket,
  pauseTicket,
  finishTicket,
  type TicketDetails,
  type TicketTimelineEvent,
} from '../api/tickets';
import { StatusChip } from './ticketStatus';

type Props = {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export function NewTicketDetailsDrawer({ ticketId, open, onClose, onUpdated }: Props) {
  const [details, setDetails] = useState<TicketDetails | null>(null);
  const [timeline, setTimeline] = useState<TicketTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const [d, t] = await Promise.all([
        getTicketDetails(ticketId),
        getTicketTimeline(ticketId),
      ]);
      setDetails(d);
      setTimeline(t);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'فشل في تحميل التذكرة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !ticketId) return;
    void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticketId]);

  const doAction = async (name: string, fn: () => Promise<any>) => {
    if (!ticketId) return;
    setBusyAction(name);
    try {
      await fn();
      setSnackMessage('تم بنجاح');
      await fetchAll();
      onUpdated?.();
    } catch (e: any) {
      setSnackMessage(e?.response?.data?.message ?? e?.message ?? 'فشل الطلب');
    } finally {
      setBusyAction(null);
      setTimeout(() => setSnackMessage(null), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackMessage('تم النسخ');
    setTimeout(() => setSnackMessage(null), 2000);
  };

  const status = details?.status ?? '';
  const showStart = status === 'ASSIGNED';
  const showPauseFinish = status === 'IN_PROGRESS';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          maxWidth: '100vw',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
                تفاصيل التذكرة
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                {details?.ticketNumber ?? '—'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {details?.status && (
                  <Chip
                    size="small"
                    label={details.status}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 700,
                    }}
                  />
                )}
                {details?.nationalSla && (
                  <Chip
                    size="small"
                    icon={<WarningAmberIcon fontSize="small" />}
                    label="SLA وطني"
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {snackMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {snackMessage}
            </Alert>
          )}

          {loading ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                جاري التحميل...
              </Typography>
            </Stack>
          ) : details ? (
            <Stack spacing={3}>
              {/* Customer Info Card */}
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    معلومات العميل
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CallIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          رقم الهاتف
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {details.phone}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(details.phone)}
                        sx={{ bgcolor: 'action.hover' }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <Button
                        variant="contained"
                        size="small"
                        component="a"
                        href={`tel:${details.phone}`}
                        startIcon={<CallIcon />}
                      >
                        اتصال
                      </Button>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <PlaceIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          المنطقة
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {details.zone}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <AccessTimeIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          تاريخ الإنشاء
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {dayjs(details.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Ticket Details */}
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    تفاصيل التذكرة
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        النوع
                      </Typography>
                      <Chip label={details.ticketType} color="primary" variant="outlined" />
                    </Box>
                    {details.description && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          الوصف
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {details.description}
                        </Typography>
                      </Box>
                    )}
                    {details.assignedTo?.type && details.assignedTo?.id && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          المسند إليه
                        </Typography>
                        <Typography variant="body1">
                          {details.assignedTo.type} / {details.assignedTo.id}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HistoryIcon color="action" />
                    <Typography sx={{ fontWeight: 700 }}>السجل الزمني</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Timeline sx={{ m: 0, p: 0 }}>
                    {timeline.map((event, idx) => (
                      <TimelineItem key={`${event.type}-${event.at}-${idx}`}>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {idx < timeline.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 600 }}>{event.type}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(event.at).format('YYYY-MM-DD HH:mm')}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </AccordionDetails>
              </Accordion>

              {/* Actions */}
              <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    الإجراءات
                  </Typography>
                  <Stack spacing={2}>
                    {showStart && (
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={
                          busyAction === 'start' ? (
                            <CircularProgress size={20} />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        onClick={() => doAction('start', () => startTicket(ticketId!))}
                        disabled={!!busyAction}
                      >
                        بدء العمل
                      </Button>
                    )}

                    {showPauseFinish && (
                      <>
                        <Button
                          variant="outlined"
                          size="large"
                          fullWidth
                          startIcon={
                            busyAction === 'pause' ? (
                              <CircularProgress size={20} />
                            ) : (
                              <PauseIcon />
                            )
                          }
                          onClick={() => doAction('pause', () => pauseTicket(ticketId!))}
                          disabled={!!busyAction}
                        >
                          إيقاف مؤقت
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          size="large"
                          fullWidth
                          startIcon={
                            busyAction === 'finish' ? (
                              <CircularProgress size={20} />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                          onClick={() => doAction('finish', () => finishTicket(ticketId!))}
                          disabled={!!busyAction}
                        >
                          إنهاء التذكرة
                        </Button>
                      </>
                    )}

                    {!showStart && !showPauseFinish && (
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        لا توجد إجراءات متاحة للحالة الحالية
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                اختر تذكرة لعرض التفاصيل
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

