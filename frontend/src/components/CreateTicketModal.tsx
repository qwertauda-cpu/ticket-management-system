import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { createTicket, createTicketDraft, type TicketAssigneeType } from '../api/tickets';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (result: any) => void;
};

const TICKET_TYPES = [
  { value: 'FTTH_NEW', label: 'تركيب ألياف جديد' },
  { value: 'RX_ISSUE', label: 'مشكلة استقبال' },
  { value: 'ONU_CHANGE', label: 'تغيير ONU' },
  { value: 'PPPOE', label: 'مشكلة PPPOE' },
  { value: 'WIFI_SIMPLE', label: 'مشكلة WiFi' },
  { value: 'CUSTOM', label: 'مخصص' },
] as const;

const steps = ['معلومات التذكرة', 'تفاصيل العميل', 'الإسناد'];

export function NewCreateTicketModal({ open, onClose, onCreated }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [tmpNumber, setTmpNumber] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Ticket Info
  const [ticketType, setTicketType] = useState('');
  const [isNationalSla, setIsNationalSla] = useState(false);

  // Step 2: Customer Info
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');

  // Step 3: Assignment
  const [assignmentMode, setAssignmentMode] = useState<'assign' | 'schedule'>('assign');
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(null);
  const [assigneeType, setAssigneeType] = useState<TicketAssigneeType>('team');
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setError(null);
    setLoadingDraft(true);
    setTmpNumber(null);

    createTicketDraft()
      .then((res) => setTmpNumber(res.temporaryTicketNumber))
      .catch((e) => setError(e?.message ?? 'فشل في إنشاء رقم مؤقت'))
      .finally(() => setLoadingDraft(false));
  }, [open]);

  const canProceedStep1 = ticketType !== '';
  const canProceedStep2 = phone.trim() !== '' && zone.trim() !== '';
  const canSubmit =
    canProceedStep1 &&
    canProceedStep2 &&
    (assignmentMode === 'schedule' ? scheduledAt !== null : assigneeId.trim() !== '');

  const handleNext = () => {
    if (activeStep === 0 && !canProceedStep1) return;
    if (activeStep === 1 && !canProceedStep2) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const common = {
        ticketType,
        phone: phone.trim(),
        zone: zone.trim(),
        description: description.trim() || undefined,
        isNationalSla,
      };

      const payload =
        assignmentMode === 'schedule'
          ? {
              ...common,
              action: 'schedule' as const,
              scheduledAt: (scheduledAt ?? dayjs()).toDate().toISOString(),
            }
          : {
              ...common,
              action: 'assign' as const,
              assigneeType,
              assigneeId: assigneeId.trim(),
            };

      const result = await createTicket(payload as any);
      onCreated?.(result);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'فشل في إنشاء التذكرة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              تذكرة جديدة
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {loadingDraft ? 'جاري التحميل...' : tmpNumber ?? '—'}
              </Typography>
              {isNationalSla && (
                <Chip
                  size="small"
                  label="SLA وطني"
                  color="error"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
          <IconButton onClick={handleClose} disabled={submitting}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Ticket Info */}
        {activeStep === 0 && (
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>نوع التذكرة *</InputLabel>
              <Select
                value={ticketType}
                label="نوع التذكرة *"
                onChange={(e) => setTicketType(e.target.value)}
              >
                {TICKET_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: isNationalSla ? 'error.50' : 'background.default',
                border: '2px solid',
                borderColor: isNationalSla ? 'error.main' : 'divider',
                transition: 'all 0.3s ease',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    SLA وطني
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    تذكرة عاجلة بأولوية عالية
                  </Typography>
                </Box>
                <Switch
                  checked={isNationalSla}
                  onChange={(e) => setIsNationalSla(e.target.checked)}
                  color="error"
                />
              </Stack>
            </Box>
          </Stack>
        )}

        {/* Step 2: Customer Info */}
        {activeStep === 1 && (
          <Stack spacing={3}>
            <TextField
              label="رقم الهاتف *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              placeholder="05xxxxxxxx"
            />
            <TextField
              label="المنطقة *"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              fullWidth
              placeholder="الرياض - حي النرجس"
            />
            <TextField
              label="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="تفاصيل المشكلة..."
            />
          </Stack>
        )}

        {/* Step 3: Assignment */}
        {activeStep === 2 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                اختر طريقة الإسناد
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={assignmentMode === 'assign' ? 'contained' : 'outlined'}
                  onClick={() => setAssignmentMode('assign')}
                  sx={{ flex: 1, py: 2 }}
                >
                  إسناد فوري
                </Button>
                <Button
                  variant={assignmentMode === 'schedule' ? 'contained' : 'outlined'}
                  onClick={() => setAssignmentMode('schedule')}
                  sx={{ flex: 1, py: 2 }}
                >
                  جدولة
                </Button>
              </Stack>
            </Box>

            {assignmentMode === 'assign' ? (
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>نوع المسند إليه</InputLabel>
                  <Select
                    value={assigneeType}
                    label="نوع المسند إليه"
                    onChange={(e) => setAssigneeType(e.target.value as TicketAssigneeType)}
                  >
                    <MenuItem value="team">فريق</MenuItem>
                    <MenuItem value="technician">فني</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="ID المسند إليه *"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  fullWidth
                  placeholder="أدخل ID الفني أو الفريق"
                />
              </Stack>
            ) : (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="التاريخ والوقت *"
                  value={scheduledAt}
                  onChange={(v) => setScheduledAt(v)}
                  minDateTime={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          إلغاء
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={submitting}>
            السابق
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !canProceedStep1) ||
              (activeStep === 1 && !canProceedStep2)
            }
          >
            التالي
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            إنشاء التذكرة
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

