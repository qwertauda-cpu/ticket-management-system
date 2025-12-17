import { useState, useEffect } from 'react';
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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

const TICKET_TYPES: Record<string, string> = {
  'تركيب جديد': 'تركيب جديد',
  'تغيير جهاز': 'تغيير جهاز',
  'مشكلة استقبال': 'مشكلة استقبال',
  'مشكلة PPPOE': 'مشكلة PPPOE',
  'مشكلة WIFI': 'مشكلة WIFI',
  'إعادة تفعيل': 'إعادة تفعيل',
  'فحص فقط': 'فحص فقط',
  'صيانة خارجية': 'صيانة خارجية',
  'قطع كيبل': 'قطع كيبل',
  'تفعيل بدون كيبل': 'تفعيل بدون كيبل',
  'أخرى (مخصص)': 'أخرى (مخصص)',
};

type Zone = {
  id: string;
  name: string;
};

type Team = {
  id: string;
  name: string;
};

type CreateTicketDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CreateTicketDialog({ open, onClose, onSuccess }: CreateTicketDialogProps) {
  const [ticketType, setTicketType] = useState('تركيب جديد');
  const [subscriberName, setSubscriberName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('');
  const [customIssue, setCustomIssue] = useState('');
  const [description, setDescription] = useState('');
  const [isNationalSla, setIsNationalSla] = useState(false);
  const [action, setAction] = useState<'schedule' | 'assign'>('schedule');
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(dayjs().add(1, 'day'));
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (open) {
      fetchZones();
      fetchTeams();
    }
  }, [open]);

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/zones', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setZones(data);
      }
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!phone || !zone) {
      setError('يجب إدخال رقم الهاتف والمنطقة');
      return;
    }

    if (ticketType === 'أخرى (مخصص)' && !customIssue) {
      setError('يجب إدخال المشكلة عند اختيار نوع مخصص');
      return;
    }

    if (action === 'schedule' && !scheduledAt) {
      setError('يجب اختيار موعد للتذكرة');
      return;
    }

    if (action === 'assign' && !teamId) {
      setError('يجب اختيار الفريق');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const body: any = {
        ticketType,
        subscriberName: subscriberName || undefined,
        phone,
        zone,
        customIssue: ticketType === 'أخرى (مخصص)' ? customIssue : undefined,
        description: description || undefined,
        isNationalSla,
        action,
      };

      if (action === 'schedule') {
        body.scheduledAt = scheduledAt?.toISOString();
      } else {
        body.assigneeType = 'team';
        body.assigneeId = teamId;
      }

      const response = await fetch('http://localhost:3000/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في إنشاء التذكرة');
      }

      // Reset form
      setTicketType('تركيب جديد');
      setSubscriberName('');
      setPhone('');
      setZone('');
      setCustomIssue('');
      setDescription('');
      setIsNationalSla(false);
      setAction('schedule');
      setScheduledAt(dayjs().add(1, 'day'));
      setTeamId('');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء التذكرة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>إنشاء تذكرة جديدة</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Ticket Type */}
          <FormControl fullWidth>
            <InputLabel>نوع التذكرة</InputLabel>
            <Select
              value={ticketType}
              label="نوع التذكرة"
              onChange={(e) => setTicketType(e.target.value)}
            >
              {Object.keys(TICKET_TYPES).map((type) => (
                <MenuItem key={type} value={type}>
                  {TICKET_TYPES[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* National SLA - تحت نوع التذكرة */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isNationalSla}
                onChange={(e) => setIsNationalSla(e.target.checked)}
              />
            }
            label="SLA وطني"
          />

          {/* Subscriber Name */}
          <TextField
            label="اسم المشترك"
            fullWidth
            value={subscriberName}
            onChange={(e) => setSubscriberName(e.target.value)}
            placeholder="اسم العميل"
          />

          {/* Phone */}
          <TextField
            label="رقم الهاتف *"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XXXXXXXXX"
          />

          {/* Zone - اختيار من قائمة */}
          <FormControl fullWidth>
            <InputLabel>المنطقة *</InputLabel>
            <Select
              value={zone}
              label="المنطقة *"
              onChange={(e) => setZone(e.target.value)}
            >
              {zones.map((z) => (
                <MenuItem key={z.id} value={z.name}>
                  {z.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Custom Issue - يظهر فقط عند اختيار "أخرى (مخصص)" */}
          {ticketType === 'أخرى (مخصص)' && (
            <TextField
              label="المشكلة *"
              fullWidth
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              placeholder="وصف المشكلة المخصصة"
            />
          )}

          {/* Description */}
          <TextField
            label="الوصف"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="تفاصيل إضافية..."
          />

          {/* Action Type */}
          <FormControl fullWidth>
            <InputLabel>الإجراء</InputLabel>
            <Select
              value={action}
              label="الإجراء"
              onChange={(e) => setAction(e.target.value as 'schedule' | 'assign')}
            >
              <MenuItem value="schedule">جدولة (Schedule)</MenuItem>
              <MenuItem value="assign">تعيين مباشر (Assign)</MenuItem>
            </Select>
          </FormControl>

          {/* Schedule Date/Time */}
          {action === 'schedule' && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="موعد التذكرة"
                value={scheduledAt}
                onChange={(newValue) => setScheduledAt(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          )}

          {/* Team selection */}
          {action === 'assign' && (
            <FormControl fullWidth>
              <InputLabel>الفريق *</InputLabel>
              <Select
                value={teamId}
                label="الفريق *"
                onChange={(e) => setTeamId(e.target.value)}
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          إنشاء التذكرة
        </Button>
      </DialogActions>
    </Dialog>
  );
}
