import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../tenants/prisma.service';
import { TenantContextService } from '../tenants/tenant-context.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async listTeams(user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;
    return prismaClient.team.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async listTeamMembers(teamId: string, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;
    
    const team = await prismaClient.team.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const members = await prismaClient.teamMember.findMany({
      where: { teamId, tenantId },
      include: {
        tenantUser: {
          include: {
            user: true,
          },
        },
      },
    });

    return members.map((m: any) => ({
      id: m.id,
      userId: m.tenantUser.userId,
      userName: m.tenantUser.user.name || m.tenantUser.user.email,
    }));
  }

  async createTeam(dto: CreateTeamDto, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const existing = await prismaClient.team.findFirst({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Team with this name already exists');
    }

    return prismaClient.team.create({
      data: {
        tenantId,
        name: dto.name,
      },
    });
  }

  async addTeamMember(teamId: string, dto: AddTeamMemberDto, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const team = await prismaClient.team.findFirst({
      where: { id: teamId, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const tenantUser = await prismaClient.tenantUser.findFirst({
      where: { tenantId, userId: dto.userId },
    });

    if (!tenantUser) {
      throw new NotFoundException('User not found in this tenant');
    }

    const existing = await prismaClient.teamMember.findFirst({
      where: { teamId, tenantUserId: tenantUser.id },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this team');
    }

    return prismaClient.teamMember.create({
      data: {
        tenantId,
        teamId,
        tenantUserId: tenantUser.id,
      },
    });
  }

  async updateTeam(id: string, dto: UpdateTeamDto, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const team = await prismaClient.team.findFirst({
      where: { id, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return prismaClient.team.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTeam(id: string, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const team = await prismaClient.team.findFirst({
      where: { id, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return prismaClient.team.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async removeTeamMember(teamId: string, memberId: string, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const member = await prismaClient.teamMember.findFirst({
      where: { id: memberId, teamId, tenantId },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return prismaClient.teamMember.delete({
      where: { id: memberId },
    });
  }
}

