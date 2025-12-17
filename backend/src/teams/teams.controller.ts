import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto';
import { RequirePermissions } from '../permissions/require-permissions.decorator';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Get()
  @RequirePermissions('teams:read')
  async listTeams(@Request() req: any) {
    return this.teams.listTeams(req.user);
  }

  @Get(':id/members')
  @RequirePermissions('teams:read')
  async listTeamMembers(@Param('id') id: string, @Request() req: any) {
    return this.teams.listTeamMembers(id, req.user);
  }

  @Post()
  @RequirePermissions('teams:create')
  async createTeam(@Body() dto: CreateTeamDto, @Request() req: any) {
    return this.teams.createTeam(dto, req.user);
  }

  @Post(':id/members')
  @RequirePermissions('teams:update')
  async addTeamMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto, @Request() req: any) {
    return this.teams.addTeamMember(id, dto, req.user);
  }

  @Patch(':id')
  @RequirePermissions('teams:update')
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto, @Request() req: any) {
    return this.teams.updateTeam(id, dto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('teams:delete')
  async deleteTeam(@Param('id') id: string, @Request() req: any) {
    return this.teams.deleteTeam(id, req.user);
  }

  @Delete(':teamId/members/:memberId')
  @RequirePermissions('teams:update')
  async removeTeamMember(@Param('teamId') teamId: string, @Param('memberId') memberId: string, @Request() req: any) {
    return this.teams.removeTeamMember(teamId, memberId, req.user);
  }
}

