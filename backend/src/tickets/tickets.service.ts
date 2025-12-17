import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../tenants/prisma.service';
import { TenantContextService } from '../tenants/tenant-context.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { QaTicketDto } from './dto/qa-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListTicketsQueryDto } from './dto/list-tickets.query.dto';
import { TicketsSummaryQueryDto } from './dto/tickets-summary.query.dto';

function yearString(date: Date): string {
  return String(date.getUTCFullYear());
}

function pad(num: number, width: number): string {
  return String(num).padStart(width, '0');
}

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  createDraftTicketNumber(now = new Date()): { temporaryTicketNumber: string } {
    const yyyy = yearString(now);
    const suffix = randomInt(1000, 10000);
    return { temporaryTicketNumber: `TMP-${yyyy}-${suffix}` };
  }

  async createTicket(dto: CreateTicketDto): Promise<any> {
    const tenantId = this.requireTenantId();
    const now = new Date();
    const yyyy = yearString(now);
    const prefix = `FTK-${yyyy}-`;

    if (dto.action === 'schedule') {
      if (!dto.scheduledAt) {
        throw new BadRequestException('scheduledAt is required when action = schedule');
      }
    } else {
      if (!dto.assigneeType || !dto.assigneeId) {
        throw new BadRequestException('assigneeType and assigneeId are required when action = assign');
      }
    }

    const prismaClient: any = this.prisma.client as any;
    if (!prismaClient.ticket?.create) {
      throw new Error(
        'Prisma Client is missing Ticket. Ensure prisma/schema.prisma defines Ticket and run prisma generate.',
      );
    }

    // Transactionally allocate the next ticket number (padded for lexicographic ordering).
    const created = await prismaClient.$transaction(
      async (tx: any) => {
        const last = await tx.ticket.findFirst({
          where: { tenantId, ticketNumber: { startsWith: prefix } },
          orderBy: { ticketNumber: 'desc' },
          select: { ticketNumber: true },
        });

        const lastNum = this.parseTicketSequence(last?.ticketNumber, prefix);
        const nextNum = lastNum + 1;
        const ticketNumber = `${prefix}${pad(nextNum, 6)}`;

        const status = dto.action === 'schedule' ? 'SCHEDULED' : 'ASSIGNED';
        const scheduledAt = dto.action === 'schedule' ? new Date(dto.scheduledAt!) : null;

        const data: Record<string, any> = {
          tenantId,
          ticketNumber,
          ticketType: dto.ticketType,
          subscriberName: dto.subscriberName || null,
          phone: dto.phone,
          zone: dto.zone,
          customIssue: dto.customIssue || null,
          description: dto.description || null,
          isNationalSla: dto.isNationalSla,
          status,
          scheduledAt,
        };

        if (dto.isNationalSla) {
          data.priority = 'HIGH';
        }

        if (dto.action === 'assign') {
          data.assigneeType = dto.assigneeType;
          data.assigneeId = dto.assigneeId;
        }

        return tx.ticket.create({
          data,
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            priority: true,
            isNationalSla: true,
            ticketType: true,
            phone: true,
            zone: true,
            description: true,
            scheduledAt: true,
            createdAt: true,
          },
        });
      },
      { isolationLevel: 'Serializable' },
    );

    // Expose national SLA clearly in payload.
    return {
      ...created,
      nationalSla: Boolean(created?.isNationalSla),
    };
  }

  async listTickets(query: ListTicketsQueryDto, user?: any): Promise<{
    items: Array<{
      id: string;
      ticketNumber: string;
      ticketType: string;
      status: string;
      priority: string | null;
      nationalSla: boolean;
      phone: string;
      zone: string;
      assignedTo: { type: 'team' | 'technician' | null; id: string | null };
      createdAt: Date;
      scheduledAt: Date | null;
    }>;
    page: number;
    pageSize: number;
    total: number;
  }> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    if (!prismaClient.ticket?.findMany) {
      throw new Error(
        'Prisma Client is missing Ticket. Ensure prisma/schema.prisma defines Ticket and run prisma generate.',
      );
    }

    const where = this.buildTicketWhere(tenantId, query, user);

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const skip = (page - 1) * pageSize;

    const [items, total] = await prismaClient.$transaction([
      prismaClient.ticket.findMany({
        where,
        orderBy: [{ isNationalSla: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          ticketNumber: true,
          ticketType: true,
          status: true,
          priority: true,
          isNationalSla: true,
          phone: true,
          zone: true,
          assigneeType: true,
          assigneeId: true,
          createdAt: true,
          scheduledAt: true,
        },
      }),
      prismaClient.ticket.count({ where }),
    ]);

    return {
      items: items.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        ticketType: t.ticketType,
        status: t.status,
        priority: t.priority ?? null,
        nationalSla: Boolean(t.isNationalSla),
        phone: t.phone,
        zone: t.zone,
        assignedTo: {
          type: t.assigneeType ?? null,
          id: t.assigneeId ?? null,
        },
        createdAt: t.createdAt,
        scheduledAt: t.scheduledAt ?? null,
      })),
      page,
      pageSize,
      total,
    };
  }

  async summary(query: TicketsSummaryQueryDto): Promise<{
    total: number;
    byStatus: Record<string, number>;
    nationalSla: number;
  }> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    if (!prismaClient.ticket?.groupBy) {
      throw new Error(
        'Prisma Client is missing Ticket.groupBy. Ensure prisma/schema.prisma defines Ticket and run prisma generate.',
      );
    }

    const { dateFrom, dateTo } = this.resolveSummaryRange(query);

    const where: any = {
      tenantId,
      createdAt: {
        gte: dateFrom,
        lt: dateTo,
      },
    };

    const [total, nationalSlaCount, grouped] = await prismaClient.$transaction([
      prismaClient.ticket.count({ where }),
      prismaClient.ticket.count({ where: { ...where, isNationalSla: true } }),
      prismaClient.ticket.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const row of grouped as any[]) {
      byStatus[row.status] = row._count?._all ?? 0;
    }

    return {
      total,
      byStatus,
      nationalSla: nationalSlaCount,
    };
  }

  private parseTicketSequence(ticketNumber: string | undefined, prefix: string): number {
    if (!ticketNumber) return 0;
    if (!ticketNumber.startsWith(prefix)) return 0;
    const suffix = ticketNumber.slice(prefix.length);
    const n = Number.parseInt(suffix, 10);
    return Number.isFinite(n) ? n : 0;
  }

  private requireTenantId(): string {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context missing');
    }
    return tenantId;
  }

  private buildTicketWhere(tenantId: string, query: ListTicketsQueryDto, user?: any): Record<string, any> {
    const where: Record<string, any> = { tenantId };

    // Filter tickets for technicians: they should only see their assigned tickets
    // A technician is someone who has ONLY ticket execution permissions (start, finish, update)
    // but NOT create or assign permissions
    if (user && !user.isOwner && user.permissions) {
      const isTechnician = user.permissions.some((p: string) => 
        p === 'tickets:start' || p === 'tickets:finish'
      ) && !user.permissions.some((p: string) => 
        p === 'tickets:create' || p === 'tickets:assign' || p === 'tickets:*' || p === '*'
      );
      
      // If user is a technician, only show their assigned tickets
      if (isTechnician && user.tenantUserId) {
        where.AND = [
          { assigneeType: 'user' },
          { assigneeId: user.tenantUserId }
        ];
      }
    }

    if (query.status?.length) {
      where.status = { in: query.status };
    }

    if (query.nationalSla !== undefined) {
      where.isNationalSla = query.nationalSla;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.zone) {
      where.zone = query.zone;
    }

    if (query.ticketType) {
      where.ticketType = query.ticketType;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lt = new Date(query.dateTo);
    }

    const team = query.teamId;
    const tech = query.technicianId;
    if (team && tech) {
      where.OR = [
        { assigneeType: 'team', assigneeId: team },
        { assigneeType: 'technician', assigneeId: tech },
      ];
    } else if (team) {
      where.assigneeType = 'team';
      where.assigneeId = team;
    } else if (tech) {
      where.assigneeType = 'technician';
      where.assigneeId = tech;
    }

    const q = query.q?.trim();
    if (q) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { ticketNumber: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    return where;
  }

  private resolveSummaryRange(query: TicketsSummaryQueryDto): { dateFrom: Date; dateTo: Date } {
    if (query.dateFrom && query.dateTo) {
      return { dateFrom: new Date(query.dateFrom), dateTo: new Date(query.dateTo) };
    }

    // Default: server-local "today" [inclusive, exclusive]
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

    return {
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : start,
      dateTo: query.dateTo ? new Date(query.dateTo) : end,
    };
  }

  async getTicketById(id: string): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async assignTicket(id: string, dto: AssignTicketDto): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'SCHEDULED' && ticket.status !== 'OPEN') {
      throw new BadRequestException('Ticket must be SCHEDULED or OPEN to assign');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        assigneeType: dto.assigneeType,
        assigneeId: dto.assigneeId,
        status: 'ASSIGNED',
        updatedAt: new Date(),
      },
    });
  }

  async startTicket(id: string): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'ASSIGNED' && ticket.status !== 'PAUSED') {
      throw new BadRequestException('Ticket must be ASSIGNED or PAUSED to start');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: ticket.startedAt || new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async pauseTicket(id: string): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Ticket must be IN_PROGRESS to pause');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        status: 'PAUSED',
        updatedAt: new Date(),
      },
    });
  }

  async resumeTicket(id: string): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'PAUSED') {
      throw new BadRequestException('Ticket must be PAUSED to resume');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    });
  }

  async finishTicket(id: string): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Ticket must be IN_PROGRESS to finish');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        status: 'PENDING_QA',
        finishedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async qaApprove(id: string, dto: QaTicketDto): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'PENDING_QA') {
      throw new BadRequestException('Ticket must be PENDING_QA to approve');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        status: 'DONE',
        qaStatus: 'APPROVED',
        qaNotes: dto.qaNotes,
        updatedAt: new Date(),
      },
    });
  }

  async qaReject(id: string, dto: QaTicketDto): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'PENDING_QA') {
      throw new BadRequestException('Ticket must be PENDING_QA to reject');
    }

    return await prismaClient.ticket.update({
      where: { id, tenantId },
      data: {
        status: 'ASSIGNED',
        qaStatus: 'REJECTED',
        qaNotes: dto.qaNotes,
        updatedAt: new Date(),
      },
    });
  }

  async updateTicket(id: string, dto: UpdateTicketDto): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Track changes for history
    const changes: any[] = [];

    if (dto.phone && dto.phone !== ticket.phone) {
      changes.push({
        action: 'UPDATE',
        field: 'phone',
        oldValue: ticket.phone,
        newValue: dto.phone,
      });
    }

    if (dto.zone && dto.zone !== ticket.zone) {
      changes.push({
        action: 'UPDATE',
        field: 'zone',
        oldValue: ticket.zone,
        newValue: dto.zone,
      });
    }

    if (dto.description !== undefined && dto.description !== ticket.description) {
      changes.push({
        action: 'UPDATE',
        field: 'description',
        oldValue: ticket.description || '',
        newValue: dto.description || '',
      });
    }

    // Update ticket and create history entries
    const result = await prismaClient.$transaction(async (tx: any) => {
      const updated = await tx.ticket.update({
        where: { id, tenantId },
        data: {
          phone: dto.phone,
          zone: dto.zone,
          description: dto.description,
          updatedAt: new Date(),
        },
      });

      // Create history entries
      for (const change of changes) {
        await tx.ticketHistory.create({
          data: {
            tenantId,
            ticketId: id,
            action: change.action,
            field: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            performedBy: 'system', // TODO: Get from auth context
            createdAt: new Date(),
          },
        });
      }

      return updated;
    });

    return result;
  }

  async getTicketHistory(id: string): Promise<any[]> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    const ticket = await prismaClient.ticket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const history = await prismaClient.ticketHistory.findMany({
      where: { ticketId: id, tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return history;
  }

  private async createHistoryEntry(ticketId: string, action: string, details?: any): Promise<void> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    await prismaClient.ticketHistory.create({
      data: {
        tenantId,
        ticketId,
        action,
        field: details?.field || null,
        oldValue: details?.oldValue || null,
        newValue: details?.newValue || null,
        performedBy: details?.performedBy || 'system',
        createdAt: new Date(),
      },
    });
  }

  async addComment(ticketId: string, dto: CreateCommentDto, user: any): Promise<any> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    // Verify ticket exists
    const ticket = await prismaClient.ticket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return await prismaClient.ticketComment.create({
      data: {
        tenantId,
        ticketId,
        userId: user.userId || user.id,
        userType: user.isSuperAdmin ? 'super_admin' : 'user',
        comment: dto.comment,
      },
    });
  }

  async getComments(ticketId: string): Promise<any[]> {
    const tenantId = this.requireTenantId();
    const prismaClient: any = this.prisma.client as any;

    // Verify ticket exists
    const ticket = await prismaClient.ticket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return await prismaClient.ticketComment.findMany({
      where: { ticketId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}


