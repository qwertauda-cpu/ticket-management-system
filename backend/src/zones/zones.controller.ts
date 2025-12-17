import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZonesService } from './zones.service';
import { CreateZoneDto, UpdateZoneDto } from './dto';
import { RequirePermissions } from '../permissions/require-permissions.decorator';

@Controller('zones')
@UseGuards(JwtAuthGuard)
export class ZonesController {
  constructor(private readonly zones: ZonesService) {}

  @Get()
  @RequirePermissions('zones:read')
  async listZones(@Request() req: any) {
    return this.zones.listZones(req.user);
  }

  @Post()
  @RequirePermissions('zones:create')
  async createZone(@Body() dto: CreateZoneDto, @Request() req: any) {
    return this.zones.createZone(dto, req.user);
  }

  @Patch(':id')
  @RequirePermissions('zones:update')
  async updateZone(@Param('id') id: string, @Body() dto: UpdateZoneDto, @Request() req: any) {
    return this.zones.updateZone(id, dto, req.user);
  }

  @Delete(':id')
  @RequirePermissions('zones:delete')
  async deleteZone(@Param('id') id: string, @Request() req: any) {
    return this.zones.deleteZone(id, req.user);
  }
}

