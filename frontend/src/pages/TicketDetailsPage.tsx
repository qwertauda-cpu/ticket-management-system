import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import { StatusChip } from '../components/ticketStatus';
import { EditTicketDialog } from '../components/EditTicketDialog';
import { TicketTimeline } from '../components/TicketTimeline';
import { canAssignTicket, canStartTicket, canFinishTicket, canUpdateTicket, canQATicket } from '../utils/permissions';

type Ticket = {
  id: string;
  ticketNumber: string;
  ticketType: string;
  status: string;
  priority: string | null;
  nationalSla: boolean;
  phone: string;
  zone: string;
  description: string | null;
  assigneeType: string | null;
  assigneeId: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  qaStatus: string | null;
  qaNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type TicketDetailsPageProps = {
  ticketId: string;
  onBack?: () => void;
};

export function TicketDetailsPage({ ticketId, onBack }: TicketDetailsPageProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Assign Dialog
  const [assignDialog, setAssignDialog] = useState(false);
  const [assigneeType, setAssigneeType] = useState('technician');
  const [assigneeId, setAssigneeId] = useState('');

  // QA Dialog
  const [qaDialog, setQaDialog] = useState(false);
  const [qaAction, setQaAction] = useState<'approve' | 'reject'>('approve');
  const [qaNotes, setQaNotes] = useState('');

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Get user from localStorage
  const user = useMemo(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل التذكرة');
      }

      const data = await response.json();
      console.log('Ticket data from API:', data);
      console.log('Ticket status:', data.status, 'Type:', typeof data.status);
      setTicket(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, body: any = {}) => {
    setActionLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/tickets/${ticketId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `فشل في ${action}`);
      }

      await fetchTicket();
      setAssignDialog(false);
      setQaDialog(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = () => {
    if (!assigneeType || !assigneeId) {
      setError('يجب اختيار نوع ومعرف المستخدم');
      return;
    }
    handleAction('assign', { assigneeType, assigneeId });
  };

  const handleQA = () => {
    if (qaAction === 'reject' && !qaNotes) {
      setError('يجب إدخال ملاحظات الرفض');
      return;
    }
    handleAction(qaAction === 'approve' ? 'qa/approve' : 'qa/reject', { qaNotes });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !ticket) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">التذكرة غير موجودة</Alert>
      </Box>
    );
  }

  // Status checks
  const statusAllowsStart = ticket.status === 'ASSIGNED' || ticket.status === 'SCHEDULED' || ticket.status === 'PAUSED';
  const statusAllowsPause = ticket.status === 'IN_PROGRESS';
  const statusAllowsResume = ticket.status === 'PAUSED';
  const statusAllowsFinish = ticket.status === 'IN_PROGRESS';
  const statusAllowsQA = ticket.status === 'FINISHED' || ticket.status === 'PENDING_QA';
  const statusAllowsAssign = ticket.status === 'OPEN' || ticket.status === 'SCHEDULED';

  // Permission checks
  const canShowAssign = canAssignTicket(user) && statusAllowsAssign;
  const canShowStart = canStartTicket(user) && statusAllowsStart;
  const canShowPause = canUpdateTicket(user) && statusAllowsPause;
  const canShowResume = canUpdateTicket(user) && statusAllowsResume;
  const canShowFinish = canFinishTicket(user) && statusAllowsFinish;
  const canShowQA = canQATicket(user) && statusAllowsQA;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {ticket.ticketNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.ticketType}
          </Typography>
        </Box>
        <StatusChip status={ticket.status} />
        {ticket.nationalSla && (
          <Chip label="SLA وطني" color="error" size="small" />
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            الإجراءات المتاحة
          </Typography>
          
          {/* Show available actions */}
          {(canShowAssign || canShowStart || canShowPause || canShowResume || canShowFinish || canShowQA) ? (
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
              {canShowAssign && (
                <Button
                  variant="contained"
                  startIcon={<AssignmentIndIcon />}
                  onClick={() => setAssignDialog(true)}
                  disabled={actionLoading}
                >
                  تعيين
                </Button>
              )}
              {canShowStart && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleAction('start')}
                  disabled={actionLoading}
                >
                  بدء العمل
                </Button>
              )}
              {canShowPause && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PauseIcon />}
                  onClick={() => handleAction('pause')}
                  disabled={actionLoading}
                >
                  إيقاف مؤقت
                </Button>
              )}
              {canShowResume && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleAction('resume')}
                  disabled={actionLoading}
                >
                  استئناف
                </Button>
              )}
              {canShowFinish && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={() => handleAction('finish')}
                  disabled={actionLoading}
                >
                  إنهاء
                </Button>
              )}
              {canShowQA && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => {
                      setQaAction('approve');
                      setQaDialog(true);
                    }}
                    disabled={actionLoading}
                  >
                    قبول (QA)
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setQaAction('reject');
                      setQaDialog(true);
                    }}
                    disabled={actionLoading}
                  >
                    رفض (QA)
                  </Button>
                </>
              )}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
              لا توجد إجراءات متاحة حالياً. الحالة الحالية: <strong>{ticket.status}</strong>
            </Alert>
          )}

          {/* Show action history summary */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            سجل الإجراءات
          </Typography>
          <Stack spacing={1}>
            {ticket.startedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon fontSize="small" color="success" />
                <Typography variant="body2">
                  بدء العمل: {new Date(ticket.startedAt).toLocaleString('ar-EG', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </Typography>
              </Box>
            )}
            {ticket.finishedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StopIcon fontSize="small" color="error" />
                <Typography variant="body2">
                  تم الإنهاء: {new Date(ticket.finishedAt).toLocaleString('ar-EG', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </Typography>
              </Box>
            )}
            {ticket.qaStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ticket.qaStatus === 'APPROVED' ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <CancelIcon fontSize="small" color="error" />
                )}
                <Typography variant="body2">
                  مراجعة الجودة: {ticket.qaStatus === 'APPROVED' ? 'تم القبول' : 'تم الرفض'}
                </Typography>
              </Box>
            )}
            {!ticket.startedAt && !ticket.finishedAt && !ticket.qaStatus && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                لم يتم تنفيذ أي إجراءات بعد
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              التفاصيل
            </Typography>
            <IconButton
              color="primary"
              onClick={() => setEditDialogOpen(true)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Stack>

          <Stack spacing={3}>
            {/* Contact Info */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                معلومات الاتصال
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography>{ticket.phone}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography>{ticket.zone}</Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Description */}
            {ticket.description && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    الوصف
                  </Typography>
                  <Typography>{ticket.description}</Typography>
                </Box>
                <Divider />
              </>
            )}

            {/* Assignment */}
            {ticket.assigneeType && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    المعين
                  </Typography>
                  <Typography>
                    {ticket.assigneeType}: {ticket.assigneeId}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}

            {/* Timestamps */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                التواريخ
              </Typography>
              <Stack spacing={1}>
                {ticket.scheduledAt && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      موعد: {new Date(ticket.scheduledAt).toLocaleString('ar-EG')}
                    </Typography>
                  </Stack>
                )}
                {ticket.startedAt && (
                  <Typography variant="body2">
                    بدء: {new Date(ticket.startedAt).toLocaleString('ar-EG')}
                  </Typography>
                )}
                {ticket.finishedAt && (
                  <Typography variant="body2">
                    انتهاء: {new Date(ticket.finishedAt).toLocaleString('ar-EG')}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  إنشاء: {new Date(ticket.createdAt).toLocaleString('ar-EG')}
                </Typography>
              </Stack>
            </Box>

            {/* QA Status */}
            {ticket.qaStatus && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    حالة المراجعة (QA)
                  </Typography>
                  <Chip
                    label={ticket.qaStatus}
                    color={ticket.qaStatus === 'APPROVED' ? 'success' : 'error'}
                    size="small"
                  />
                  {ticket.qaNotes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ملاحظات: {ticket.qaNotes}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Box sx={{ mt: 3 }}>
        <TicketTimeline ticketId={ticketId} />
      </Box>

      {/* Assign Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعيين التذكرة</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>نوع المستخدم</InputLabel>
              <Select
                value={assigneeType}
                label="نوع المستخدم"
                onChange={(e) => setAssigneeType(e.target.value)}
              >
                <MenuItem value="technician">فني</MenuItem>
                <MenuItem value="team">فريق</MenuItem>
                <MenuItem value="contractor">مقاول</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="معرف المستخدم"
              fullWidth
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="مثال: tech-001"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleAssign} disabled={actionLoading}>
            تعيين
          </Button>
        </DialogActions>
      </Dialog>

      {/* QA Dialog */}
      <Dialog open={qaDialog} onClose={() => setQaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {qaAction === 'approve' ? 'قبول التذكرة' : 'رفض التذكرة'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="ملاحظات"
            fullWidth
            multiline
            rows={4}
            value={qaNotes}
            onChange={(e) => setQaNotes(e.target.value)}
            placeholder={qaAction === 'reject' ? 'يجب إدخال سبب الرفض' : 'ملاحظات اختيارية'}
            required={qaAction === 'reject'}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQaDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color={qaAction === 'approve' ? 'success' : 'error'}
            onClick={handleQA}
            disabled={actionLoading}
          >
            {qaAction === 'approve' ? 'قبول' : 'رفض'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <EditTicketDialog
        open={editDialogOpen}
        ticket={ticket}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={fetchTicket}
      />
    </Box>
  );
}
