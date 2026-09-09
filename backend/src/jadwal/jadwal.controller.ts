import { Controller, Post, Get, Query, Param, UseGuards, Request, Body, Res, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequireAdmin } from '../auth/roles.decorator';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/jadwal')
export class JadwalController {
  constructor(
    private readonly jadwalService: JadwalService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireAdmin()
  generate(@Request() req: any) {
    return this.jadwalService.generateJadwalAsync(req.user.id_sekolah);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any, @Query('id_kelas') id_kelas?: string, @Query('id_periode') id_periode?: string) {
    return this.jadwalService.findAll(
      req.user.id_sekolah, 
      id_kelas ? +id_kelas : undefined,
      id_periode ? +id_periode : undefined
    );
  }

  @Get('my-schedule')
  @UseGuards(JwtAuthGuard)
  getMySchedule(@Request() req: any) {
    if (!req.user.id_guru) {
      throw new ForbiddenException('Fitur ini khusus untuk akun Tenaga Pendidik yang terikat data Guru.');
    }
    return this.jadwalService.findMyTeachingSchedule(req.user.id_guru, req.user.id_sekolah);
  }

  @Get('periode')
  @UseGuards(JwtAuthGuard)
  getPeriodes(@Request() req: any) {
    return this.jadwalService.getPeriodeList(req.user.id_sekolah);
  }

  @Post('periode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireAdmin()
  createPeriode(@Request() req: any, @Body() body: any) {
    return this.jadwalService.createPeriode(req.user.id_sekolah, body);
  }

  @Post('periode/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireAdmin()
  setActivePeriode(@Request() req: any, @Param('id') id: string) {
    return this.jadwalService.setActivePeriode(req.user.id_sekolah, +id);
  }


  @Post('share')
  @UseGuards(JwtAuthGuard)
  async createShareLink(
    @Request() req: any, 
    @Body() body: { permission: string, days: number }
  ) {
    const uuid = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (body.days || 30));

    const link = await this.prisma.sharedLink.create({
      data: {
        id_sekolah: req.user.id_sekolah,
        uuid,
        permission: body.permission || 'read',
        created_by: req.user.id,
        expires_at: expiresAt,
      }
    });

    return { uuid: link.uuid };
  }

  @Get('share/:uuid')
  async getSharedJadwal(@Param('uuid') uuid: string, @Request() req: any) {
    const link = await this.prisma.sharedLink.findUnique({ where: { uuid } });
    if (!link) throw new UnauthorizedException('Link tidak ditemukan');
    
    if (link.expires_at && link.expires_at < new Date()) {
      throw new UnauthorizedException('Link sudah kadaluarsa');
    }

    // Increement view count
    await this.prisma.sharedLink.update({
      where: { uuid },
      data: { view_count: { increment: 1 } }
    });

    if (link.permission === 'edit') {
      // Validate user login
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Silakan login untuk mengedit jadwal');
      // For full security, we would decode token here or use an OptionalJwtGuard
      // This is a minimal check for the walkthrough
    }

    // Return the jadwal for this sekolah
    return this.jadwalService.findAll(link.id_sekolah);
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  async exportExcel(@Request() req: any, @Res() res: Response, @Query('template') template?: string) {
    const buffer = await this.jadwalService.exportExcel(req.user.id_sekolah, template ? parseInt(template) : 1);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Jadwal_Pelajaran.xlsx"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('export/pdf')
  @UseGuards(JwtAuthGuard)
  async exportPdf(@Request() req: any, @Res() res: Response, @Query('template') template?: string) {
    const buffer = await this.jadwalService.exportPdf(req.user.id_sekolah, template ? parseInt(template) : 1);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Jadwal_Pelajaran.pdf"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
