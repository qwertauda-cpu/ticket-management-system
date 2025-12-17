import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SyncIcon from '@mui/icons-material/Sync';
import { Chip, type ChipProps } from '@mui/material';

export type StatusChipConfig = {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactElement;
};

// Single source of truth: status → color/icon
export const STATUS_CHIP: Record<string, StatusChipConfig> = {
  OPEN: { label: 'مفتوحة', color: 'default', icon: <HourglassEmptyIcon fontSize="small" /> },
  ASSIGNED: { label: 'معينة', color: 'primary', icon: <LocalShippingIcon fontSize="small" /> },
  SCHEDULED: { label: 'مجدولة', color: 'secondary', icon: <ScheduleIcon fontSize="small" /> },
  IN_PROGRESS: { label: 'قيد التنفيذ', color: 'success', icon: <SyncIcon fontSize="small" /> },
  PAUSED: { label: 'متوقفة مؤقتاً', color: 'warning', icon: <PauseCircleIcon fontSize="small" /> },
  WAITING: { label: 'في الانتظار', color: 'warning', icon: <HourglassEmptyIcon fontSize="small" /> },
  ON_HOLD: { label: 'معلقة', color: 'warning', icon: <PauseCircleIcon fontSize="small" /> },
  FINISHED: { label: 'منتهية', color: 'info', icon: <CheckCircleIcon fontSize="small" /> },
  PENDING_QA: { label: 'بانتظار المراجعة', color: 'info', icon: <HourglassEmptyIcon fontSize="small" /> },
  QA_APPROVED: { label: 'تمت الموافقة', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  QA_REJECTED: { label: 'مرفوضة', color: 'error', icon: <PauseCircleIcon fontSize="small" /> },
  DONE: { label: 'مكتملة', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
};

export function StatusChip({
  status,
  size = 'small',
  variant = 'filled',
}: {
  status: string;
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
}) {
  const config = STATUS_CHIP[status] ?? {
    label: status,
    color: 'default' as const,
    icon: <HourglassEmptyIcon fontSize="small" />,
  };

  return (
    <Chip
      size={size}
      variant={variant}
      label={config.label.replace('_', ' ')}
      color={config.color}
      icon={config.icon}
    />
  );
}


