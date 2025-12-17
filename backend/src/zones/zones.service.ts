import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../tenants/prisma.service';
import { TenantContextService } from '../tenants/tenant-context.service';
import { CreateZoneDto, UpdateZoneDto } from './dto';

@Injectable()
export class ZonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async listZones(user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;
    return prismaClient.zone.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createZone(dto: CreateZoneDto, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    // Check for duplicate
    const existing = await prismaClient.zone.findFirst({
      where: { tenantId, name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Zone with this name already exists');
    }

    return prismaClient.zone.create({
      data: {
        tenantId,
        name: dto.name,
      },
    });
  }

  async updateZone(id: string, dto: UpdateZoneDto, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const zone = await prismaClient.zone.findFirst({
      where: { id, tenantId },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    return prismaClient.zone.update({
      where: { id },
      data: dto,
    });
  }

  async deleteZone(id: string, user: any) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const prismaClient: any = this.prisma.client as any;

    const zone = await prismaClient.zone.findFirst({
      where: { id, tenantId },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    // Soft delete
    return prismaClient.zone.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

