import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';

type HistoryEntry = {
  id: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  performedBy: string | null;
  createdAt: string;
};

type TicketTimelineProps = {
  ticketId: string;
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'UPDATE':
      return <EditIcon />;
    case 'ASSIGN':
      return <AssignmentIndIcon />;
    case 'START':
      return <PlayArrowIcon />;
    case 'PAUSE':
      return <PauseIcon />;
    case 'RESUME':
      return <PlayArrowIcon />;
    case 'FINISH':
      return <CheckCircleIcon />;
    case 'QA_APPROVE':
      return <CheckCircleIcon />;
    case 'QA_REJECT':
      return <CancelIcon />;
    default:
      return <HistoryIcon />;
  }
};

const getActionColor = (action: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'grey' => {
  switch (action) {
    case 'UPDATE':
      return 'info';
    case 'ASSIGN':
      return 'primary';
    case 'START':
    case 'RESUME':
      return 'success';
    case 'PAUSE':
      return 'warning';
    case 'FINISH':
      return 'success';
    case 'QA_APPROVE':
      return 'success';
    case 'QA_REJECT':
      return 'error';
    default:
      return 'grey';
  }
};

const getActionLabel = (action: string, field?: string | null) => {
  switch (action) {
    case 'UPDATE':
      return field ? `تعديل ${field}` : 'تعديل';
    case 'ASSIGN':
      return 'تعيين';
    case 'START':
      return 'بدء العمل';
    case 'PAUSE':
      return 'إيقاف مؤقت';
    case 'RESUME':
      return 'استئناف';
    case 'FINISH':
      return 'إنهاء';
    case 'QA_APPROVE':
      return 'قبول (QA)';
    case 'QA_REJECT':
      return 'رفض (QA)';
    default:
      return action;
  }
};

export function TicketTimeline({ ticketId }: TicketTimelineProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [ticketId]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/tickets/${ticketId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل السجل');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            لا يوجد سجل للتذكرة بعد
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          سجل التذكرة (Timeline)
        </Typography>

        <Timeline position="right">
          {history.map((entry, index) => (
            <TimelineItem key={entry.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                <Typography variant="caption">
                  {new Date(entry.createdAt).toLocaleString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getActionColor(entry.action)}>
                  {getActionIcon(entry.action)}
                </TimelineDot>
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {getActionLabel(entry.action, entry.field)}
                  </Typography>

                  {entry.field && (entry.oldValue || entry.newValue) && (
                    <Box>
                      {entry.oldValue && (
                        <Typography variant="caption" color="text.secondary">
                          من: {entry.oldValue}
                        </Typography>
                      )}
                      {entry.newValue && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          إلى: {entry.newValue}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {entry.performedBy && (
                    <Typography variant="caption" color="text.secondary">
                      بواسطة: {entry.performedBy}
                    </Typography>
                  )}
                </Stack>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}

