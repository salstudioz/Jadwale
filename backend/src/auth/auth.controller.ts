import { Controller, Post, Body, UnauthorizedException, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService
  ) {}

  @Post('login')
  async login(@Body() req: any) {
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }
    return this.authService.login(user);
  }

  // Pendaftaran Sekolah (Admin Sekolah)
  @Post('signup')
  async signup(@Body() body: any) {
    return this.authService.registerSchool(body);
  }

  @Post('signup/school')
  async signupSchool(@Body() body: any) {
    return this.authService.registerSchool(body);
  }

  // Pendaftaran Tenaga Pendidik (Guru)
  @Post('signup/teacher')
  async signupTeacher(@Body() body: any) {
    return this.authService.registerTeacher(body);
  }

  // Pendaftaran User Biasa (Wali Murid / Umum)
  @Post('signup/public')
  async signupPublic(@Body() body: any) {
    return this.authService.registerPublicUser(body);
  }

  // Public endpoint untuk opsi pilihan Sekolah saat Guru mendaftar
  @Get('sekolah-list')
  async getPublicSekolahList() {
    return this.prisma.sekolah.findMany({
      select: {
        id: true,
        nama_sekolah: true,
        npsn: true,
        alamat: true,
      },
      orderBy: { nama_sekolah: 'asc' }
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return req.user;
  }
}

