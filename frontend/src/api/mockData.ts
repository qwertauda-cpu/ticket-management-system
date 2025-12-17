// Mock data للتطوير بدون Backend
import type { TicketCard, TicketsSummaryResponse, TicketDetails, TicketTimelineEvent } from './tickets';

export const mockTickets: TicketCard[] = [
  {
    id: '1',
    ticketNumber: 'FTK-2024-000001',
    ticketType: 'FTTH_NEW',
    status: 'ASSIGNED',
    priority: 'HIGH',
    nationalSla: true,
    phone: '0501234567',
    zone: 'الرياض - حي النرجس',
    assignedTo: { type: 'technician', id: 'tech-123' },
    createdAt: new Date().toISOString(),
    scheduledAt: null,
  },
  {
    id: '2',
    ticketNumber: 'FTK-2024-000002',
    ticketType: 'RX_ISSUE',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    nationalSla: false,
    phone: '0509876543',
    zone: 'جدة - حي الروضة',
    assignedTo: { type: 'team', id: 'team-456' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    scheduledAt: null,
  },
  {
    id: '3',
    ticketNumber: 'FTK-2024-000003',
    ticketType: 'ONU_CHANGE',
    status: 'DONE',
    priority: 'LOW',
    nationalSla: false,
    phone: '0551112233',
    zone: 'الدمام - حي الفيصلية',
    assignedTo: { type: 'technician', id: 'tech-789' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    scheduledAt: null,
  },
  {
    id: '4',
    ticketNumber: 'FTK-2024-000004',
    ticketType: 'WIFI_SIMPLE',
    status: 'OPEN',
    priority: null,
    nationalSla: false,
    phone: '0544445566',
    zone: 'مكة - حي العزيزية',
    assignedTo: { type: null, id: null },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    scheduledAt: null,
  },
  {
    id: '5',
    ticketNumber: 'FTK-2024-000005',
    ticketType: 'PPPOE',
    status: 'SCHEDULED',
    priority: 'HIGH',
    nationalSla: true,
    phone: '0567778899',
    zone: 'المدينة - حي العيون',
    assignedTo: { type: null, id: null },
    createdAt: new Date(Date.now() - 900000).toISOString(),
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

export const mockSummary: TicketsSummaryResponse = {
  total: 45,
  byStatus: {
    OPEN: 5,
    ASSIGNED: 15,
    IN_PROGRESS: 10,
    SCHEDULED: 3,
    WAITING: 2,
    ON_HOLD: 3,
    DONE: 7,
  },
  nationalSla: 12,
};

export const mockTicketDetails: TicketDetails = {
  id: '1',
  ticketNumber: 'FTK-2024-000001',
  ticketType: 'FTTH_NEW',
  status: 'ASSIGNED',
  priority: 'HIGH',
  nationalSla: true,
  phone: '0501234567',
  zone: 'الرياض - حي النرجس',
  description: 'تركيب ألياف بصرية جديد للعميل',
  assignedTo: { type: 'technician', id: 'tech-123' },
  createdAt: new Date().toISOString(),
  scheduledAt: null,
};

export const mockTimeline: TicketTimelineEvent[] = [
  {
    type: 'CREATED',
    at: new Date().toISOString(),
  },
  {
    type: 'ASSIGNED',
    at: new Date(Date.now() - 300000).toISOString(),
    byUserId: 'user-123',
  },
];

