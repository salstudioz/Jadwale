import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: { sekolah: true, guru: true }
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (user.is_active === false) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan oleh administrator.');
    }

    if (user.is_verified === false) {
      if (user.role === 'ADMIN_SEKOLAH') {
        throw new UnauthorizedException('Akun Admin Sekolah Anda sedang menunggu verifikasi dari Superadmin.');
      } else if (user.role === 'TENAGA_PENDIDIK') {
        const sekolahNama = user.sekolah?.nama_sekolah ? ` (${user.sekolah.nama_sekolah})` : '';
        throw new UnauthorizedException(`Akun Tenaga Pendidik Anda sedang menunggu verifikasi dari Admin Sekolah${sekolahNama}.`);
      } else {
        throw new UnauthorizedException('Akun Anda belum diverifikasi.');
      }
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      id_sekolah: user.id_sekolah,
      id_guru: user.id_guru,
      role: (user.email === 'superadmin@jadwale.id' || user.role === 'SUPER_ADMIN')
        ? 'SUPER_ADMIN'
        : user.role || (user.is_admin ? 'ADMIN_SEKOLAH' : 'TENAGA_PENDIDIK'),
      is_admin: user.is_admin || user.role === 'ADMIN_SEKOLAH' || user.role === 'SUPER_ADMIN',
      is_verified: user.is_verified
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: payload.role,
        is_admin: payload.is_admin,
        id_sekolah: user.id_sekolah,
        id_guru: user.id_guru,
        is_verified: user.is_verified,
        sekolah: user.sekolah
      }
    };
  }

  // 1. Pendaftaran Sekolah (Admin Sekolah) - Memerlukan Verifikasi Superadmin
  async registerSchool(data: { nama: string; email: string; password: string; nama_sekolah: string; npsn?: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar. Silakan gunakan email lain.');
    }

    const npsn = data.npsn || String(Math.floor(10000000 + Math.random() * 90000000));
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const sekolah = await tx.sekolah.create({
        data: {
          nama_sekolah: data.nama_sekolah,
          npsn,
          config: {
            create: {
              is_parallel: false,
              class_naming: 'alphabet',
              school_days: 5,
              start_time: new Date('1970-01-01T07:00:00Z'),
              duration_per_jp: 35,
              has_routine: true,
              routine_duration: 15,
              has_monday_ceremony: true,
            }
          }
        }
      });

      const user = await tx.user.create({
        data: {
          nama: data.nama,
          email: data.email,
          password: hashedPassword,
          role: 'ADMIN_SEKOLAH',
          is_admin: true,
          is_verified: false, // Perlu verifikasi Superadmin
          id_sekolah: sekolah.id,
        }
      });

      return {
        message: 'Pendaftaran sekolah berhasil. Akun Admin Sekolah Anda sedang menunggu verifikasi oleh Superadmin.',
        requires_verification: true,
        user: { id: user.id, nama: user.nama, email: user.email, role: user.role, is_verified: false }
      };
    });
  }

  // 2. Pendaftaran Tenaga Pendidik (Guru) - Memerlukan Verifikasi Admin Sekolah
  async registerTeacher(data: { nama: string; email: string; password: string; id_sekolah: number; nip?: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar. Silakan gunakan email lain.');
    }

    const sekolah = await this.prisma.sekolah.findUnique({ where: { id: Number(data.id_sekolah) } });
    if (!sekolah) {
      throw new BadRequestException('Sekolah yang dipilih tidak ditemukan.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.$transaction(async (tx) => {
      // Buat data Guru jika NIP diberikan atau nama
      let guru = null;
      if (data.nip) {
        guru = await tx.guru.findUnique({ where: { nip: data.nip } });
      }

      if (!guru) {
        guru = await tx.guru.create({
          data: {
            id_sekolah: sekolah.id,
            nama: data.nama,
            nip: data.nip || null,
          }
        });
      }

      const user = await tx.user.create({
        data: {
          nama: data.nama,
          email: data.email,
          password: hashedPassword,
          role: 'TENAGA_PENDIDIK',
          is_admin: false,
          is_verified: false, // Perlu verifikasi Admin Sekolah
          id_sekolah: sekolah.id,
          id_guru: guru.id,
        }
      });

      return {
        message: `Pendaftaran Tenaga Pendidik berhasil. Akun Anda sedang menunggu persetujuan dari Admin Sekolah (${sekolah.nama_sekolah}).`,
        requires_verification: true,
        user: { id: user.id, nama: user.nama, email: user.email, role: user.role, is_verified: false }
      };
    });
  }

  // 3. Pendaftaran User Biasa (Wali Murid / Umum) - Langsung Aktif
  async registerPublicUser(data: { nama: string; email: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar. Silakan gunakan email lain.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nama: data.nama,
        email: data.email,
        password: hashedPassword,
        role: 'USER_BIASA',
        is_admin: false,
        is_verified: true, // Langsung aktif
        id_sekolah: null,
      }
    });

    return this.login(user);
  }
}

