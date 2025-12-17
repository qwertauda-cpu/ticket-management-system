import { Body, Controller, Get, Post, Patch, Param, Query, Req, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permissions/permission.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { CreateTicketDraftDto } from './dto/create-ticket-draft.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { QaTicketDto } from './dto/qa-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListTicketsQueryDto } from './dto/list-tickets.query.dto';
import { TicketsSummaryQueryDto } from './dto/tickets-summary.query.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  @RequirePermissions('tickets:read')
  async list(@Query() query: ListTicketsQueryDto, @Request() req: any) {
    return this.tickets.listTickets(query, req.user);
  }

  @Get('summary')
  @RequirePermissions('tickets:read')
  async summary(@Query() query: TicketsSummaryQueryDto) {
    return this.tickets.summary(query);
  }

  @Post('draft')
  @RequirePermissions('tickets:create')
  async draft(@Body() _dto: CreateTicketDraftDto) {
    return this.tickets.createDraftTicketNumber();
  }

  @Post()
  @RequirePermissions('tickets:create')
  async create(@Body() dto: CreateTicketDto) {
    return this.tickets.createTicket(dto);
  }

  @Get(':id')
  @RequirePermissions('tickets:read')
  async getById(@Param('id') id: string) {
    return this.tickets.getTicketById(id);
  }

  @Patch(':id')
  @RequirePermissions('tickets:update')
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.tickets.updateTicket(id, dto);
  }

  @Get(':id/history')
  @RequirePermissions('tickets:read')
  async getHistory(@Param('id') id: string) {
    return this.tickets.getTicketHistory(id);
  }

  @Patch(':id/assign')
  @RequirePermissions('tickets:assign')
  async assign(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.tickets.assignTicket(id, dto);
  }

  @Patch(':id/start')
  @RequirePermissions('tickets:start')
  async start(@Param('id') id: string) {
    return this.tickets.startTicket(id);
  }

  @Patch(':id/pause')
  @RequirePermissions('tickets:update')
  async pause(@Param('id') id: string) {
    return this.tickets.pauseTicket(id);
  }

  @Patch(':id/resume')
  @RequirePermissions('tickets:update')
  async resume(@Param('id') id: string) {
    return this.tickets.resumeTicket(id);
  }

  @Patch(':id/finish')
  @RequirePermissions('tickets:finish')
  async finish(@Param('id') id: string) {
    return this.tickets.finishTicket(id);
  }

  @Patch(':id/qa/approve')
  @RequirePermissions('tickets:update')
  async qaApprove(@Param('id') id: string, @Body() dto: QaTicketDto) {
    return this.tickets.qaApprove(id, dto);
  }

  @Patch(':id/qa/reject')
  @RequirePermissions('tickets:update')
  async qaReject(@Param('id') id: string, @Body() dto: QaTicketDto) {
    return this.tickets.qaReject(id, dto);
  }

  @Post(':id/comments')
  @RequirePermissions('tickets:read')
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Req() req: any) {
    return this.tickets.addComment(id, dto, req.user);
  }

  @Get(':id/comments')
  @RequirePermissions('tickets:read')
  async getComments(@Param('id') id: string) {
    return this.tickets.getComments(id);
  }
}


