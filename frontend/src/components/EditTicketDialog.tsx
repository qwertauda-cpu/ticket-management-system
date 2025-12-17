import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';

type Ticket = {
  id: string;
  phone: string;
  zone: string;
  description: string | null;
};

type EditTicketDialogProps = {
  open: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditTicketDialog({ open, ticket, onClose, onSuccess }: EditTicketDialogProps) {
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticket) {
      setPhone(ticket.phone);
      setZone(ticket.zone);
      setDescription(ticket.description || '');
    }
  }, [ticket]);

  const handleSubmit = async () => {
    if (!ticket) return;

    // Validation
    if (!phone || !zone) {
      setError('يجب إدخال رقم الهاتف والمنطقة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const body = {
        phone,
        zone,
        description: description || undefined,
      };

      const response = await fetch(`http://localhost:3000/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'فشل في تعديل التذكرة');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تعديل التذكرة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>تعديل التذكرة</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Phone */}
          <TextField
            label="رقم الهاتف *"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XXXXXXXXX"
          />

          {/* Zone */}
          <TextField
            label="المنطقة *"
            fullWidth
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="مثال: Baghdad - Karrada"
          />

          {/* Description */}
          <TextField
            label="الوصف"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف المشكلة أو التفاصيل..."
          />
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
          حفظ التعديلات
        </Button>
      </DialogActions>
    </Dialog>
  );
}

