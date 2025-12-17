import axios from 'axios';
import { mockTickets, mockSummary, mockTicketDetails, mockTimeline } from './mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000';
const USE_MOCK = false;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dev-friendly error logging to distinguish auth vs CORS/network.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const cfg = err?.config;
    const url = cfg?.baseURL ? `${cfg.baseURL}${cfg.url ?? ''}` : cfg?.url;

    if (err?.response) {
      const status = err.response.status;
      const message = err.response.data?.message ?? err.response.statusText ?? 'Request failed';
      const kind = status === 401 ? '401 Unauthorized' : status === 403 ? '403 Forbidden' : `HTTP ${status}`;
      // eslint-disable-next-line no-console
      console.error(`[API] ${kind} ${cfg?.method?.toUpperCase?.() ?? ''} ${url}`, message, err.response.data);
    } else if (err?.request) {
      // eslint-disable-next-line no-console
      console.error(
        `[API] Network/CORS error ${cfg?.method?.toUpperCase?.() ?? ''} ${url}`,
        'If backend is running, this is usually CORS or wrong API URL.',
        err.message,
      );
    } else {
      // eslint-disable-next-line no-console
      console.error('[API] Axios error', err?.message ?? err);
    }

    return Promise.reject(err);
  },
);

export function setAuthToken(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function removeAuthToken() {
  delete api.defaults.headers.common.Authorization;
}

export type CreateTicketDraftResponse = {
  temporaryTicketNumber: string;
};

export async function createTicketDraft(): Promise<CreateTicketDraftResponse> {
  const res = await api.post<CreateTicketDraftResponse>('/tickets/draft', {});
  return res.data;
}

export type TicketAssigneeType = 'team' | 'technician';

export type CreateTicketRequestBase = {
  ticketType: string;
  phone: string;
  zone: string;
  description?: string;
  isNationalSla: boolean;
};

export type CreateTicketAssignRequest = CreateTicketRequestBase & {
  action: 'assign';
  assigneeType: TicketAssigneeType;
  assigneeId: string;
};

export type CreateTicketScheduleRequest = CreateTicketRequestBase & {
  action: 'schedule';
  scheduledAt: string;
};

export type CreateTicketRequest = CreateTicketAssignRequest | CreateTicketScheduleRequest;

export async function createTicket(body: CreateTicketRequest): Promise<any> {
  const res = await api.post('/tickets', body);
  return res.data;
}

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'ON_HOLD'
  | 'DONE';

export type TicketCard = {
  id: string;
  ticketNumber: string;
  ticketType: string;
  status: TicketStatus | string;
  priority: string | null;
  nationalSla: boolean;
  phone: string;
  zone: string;
  assignedTo: { type: TicketAssigneeType | null; id: string | null };
  createdAt: string;
  scheduledAt: string | null;
};

export type ListTicketsResponse = {
  items: TicketCard[];
  page: number;
  pageSize: number;
  total: number;
};

export type ListTicketsParams = {
  page?: number;
  pageSize?: number;
  status?: string[]; // multiple allowed
  nationalSla?: boolean;
  zone?: string;
  q?: string;
};

export async function listTickets(params: ListTicketsParams): Promise<ListTicketsResponse> {
  if (USE_MOCK) {
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay
    return {
      items: mockTickets,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      total: mockTickets.length,
    };
  }
  const res = await api.get<ListTicketsResponse>('/tickets', { params });
  return res.data;
}

export type TicketsSummaryResponse = {
  total: number;
  byStatus: Record<string, number>;
  nationalSla: number;
};

export async function getTicketsSummary(): Promise<TicketsSummaryResponse> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSummary;
  }
  const res = await api.get<TicketsSummaryResponse>('/tickets/summary');
  return res.data;
}

export type TicketDetails = {
  id: string;
  ticketNumber: string;
  ticketType: string;
  status: string;
  priority: string | null;
  nationalSla: boolean;
  phone: string;
  zone: string;
  description: string | null;
  assignedTo: { type: TicketAssigneeType | null; id: string | null };
  createdAt: string;
  scheduledAt: string | null;
  // May exist depending on backend version; UI treats as optional.
  qaStatus?: string | null;
};

export type TicketTimelineEvent = {
  type: 'CREATED' | 'ASSIGNED' | 'SCHEDULED' | 'STATUS_CHANGED' | 'COMMENT';
  at: string;
  byUserId?: string;
  meta?: any;
};

export async function getTicketDetails(id: string): Promise<TicketDetails> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTicketDetails;
  }
  const res = await api.get<TicketDetails>(`/tickets/${id}`);
  return res.data;
}

export async function getTicketTimeline(id: string): Promise<TicketTimelineEvent[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTimeline;
  }
  const res = await api.get<TicketTimelineEvent[]>(`/tickets/${id}/timeline`);
  return res.data;
}

export async function startTicket(id: string): Promise<any> {
  const res = await api.post(`/tickets/${id}/start`, {});
  return res.data;
}

export async function pauseTicket(id: string): Promise<any> {
  const res = await api.post(`/tickets/${id}/pause`, {});
  return res.data;
}

export async function resumeTicket(id: string): Promise<any> {
  const res = await api.post(`/tickets/${id}/resume`, {});
  return res.data;
}

export async function finishTicket(id: string): Promise<any> {
  const res = await api.post(`/tickets/${id}/finish`, {});
  return res.data;
}

export async function qaApproveTicket(id: string): Promise<any> {
  const res = await api.post(`/tickets/${id}/qa/approve`, {});
  return res.data;
}

export async function qaRejectTicket(id: string, qaNotes: string): Promise<any> {
  const res = await api.post(`/tickets/${id}/qa/reject`, { qaNotes });
  return res.data;
}


