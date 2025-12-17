import { useState } from 'react';
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
  Chip,
  Box,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export type AdvancedFilters = {
  dateFrom?: string;
  dateTo?: string;
  zone?: string;
  ticketType?: string;
  priority?: string;
  status?: string[];
  nationalSla?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
};

const TICKET_TYPES = ['تركيب', 'صيانة', 'استعلام', 'شكوى', 'متابعة'];
const PRIORITIES = ['عالية', 'متوسطة', 'منخفضة'];
const STATUSES = [
  { value: 'OPEN', label: 'مفتوحة' },
  { value: 'ASSIGNED', label: 'معينة' },
  { value: 'IN_PROGRESS', label: 'قيد التنفيذ' },
  { value: 'PAUSED', label: 'متوقفة مؤقتاً' },
  { value: 'FINISHED', label: 'منتهية' },
  { value: 'QA_APPROVED', label: 'تمت الموافقة' },
  { value: 'QA_REJECTED', label: 'مرفوضة' },
];

export function AdvancedFiltersDialog({ open, onClose, onApply, currentFilters }: Props) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: AdvancedFilters = {};
    setFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterListIcon />
        فلاتر متقدمة
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Date Range */}
          <Box>
            <InputLabel sx={{ mb: 1, fontWeight: 600 }}>نطاق التاريخ</InputLabel>
            <Stack direction="row" spacing={2}>
              <TextField
                label="من تاريخ"
                type="date"
                fullWidth
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="إلى تاريخ"
                type="date"
                fullWidth
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>

          {/* Zone */}
          <TextField
            label="المنطقة"
            fullWidth
            value={filters.zone || ''}
            onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            placeholder="مثال: الرياض - حي النخيل"
          />

          {/* Ticket Type */}
          <FormControl fullWidth>
            <InputLabel>نوع التذكرة</InputLabel>
            <Select
              value={filters.ticketType || ''}
              label="نوع التذكرة"
              onChange={(e) => setFilters({ ...filters, ticketType: e.target.value })}
            >
              <MenuItem value="">الكل</MenuItem>
              {TICKET_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority */}
          <FormControl fullWidth>
            <InputLabel>الأولوية</InputLabel>
            <Select
              value={filters.priority || ''}
              label="الأولوية"
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <MenuItem value="">الكل</MenuItem>
              {PRIORITIES.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status (Multiple) */}
          <FormControl fullWidth>
            <InputLabel>الحالة (يمكن اختيار متعدد)</InputLabel>
            <Select
              multiple
              value={filters.status || []}
              label="الحالة (يمكن اختيار متعدد)"
              onChange={(e) => {
                const value = e.target.value;
                setFilters({ ...filters, status: typeof value === 'string' ? [value] : value });
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const status = STATUSES.find((s) => s.value === value);
                    return <Chip key={value} label={status?.label || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* National SLA */}
          <FormControl fullWidth>
            <InputLabel>SLA وطني</InputLabel>
            <Select
              value={filters.nationalSla === undefined ? '' : filters.nationalSla ? 'true' : 'false'}
              label="SLA وطني"
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  nationalSla: value === '' ? undefined : value === 'true',
                });
              }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="true">نعم</MenuItem>
              <MenuItem value="false">لا</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClear} startIcon={<ClearIcon />} color="error">
          مسح الفلاتر
        </Button>
        <Button onClick={onClose}>إلغاء</Button>
        <Button onClick={handleApply} variant="contained" startIcon={<FilterListIcon />}>
          تطبيق الفلاتر
        </Button>
      </DialogActions>
    </Dialog>
  );
}

