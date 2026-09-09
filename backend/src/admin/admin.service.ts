import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        is_active: true,
        is_verified: true,
        is_admin: true,
        last_login: true,
        created_at: true,
        sekolah: {
          select: { id: true, nama_sekolah: true, npsn: true, alamat: true }
        },
        guru: {
          select: { id: true, nama: true, nip: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getSekolahList() {
    return this.prisma.sekolah.findMany({
      where: { deleted_at: null },
      include: {
        users: {
          select: { id: true, nama: true, email: true, role: true, is_verified: true, is_active: true }
        },
        _count: {
          select: { gurus: true, kelas: true, mapels: true, jadwals: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async setStatus(id: number, is_active: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { is_active }
    });
  }

  // Get pending school admin registrations
  async getPendingSchools() {
    return this.prisma.user.findMany({
      where: {
        role: 'ADMIN_SEKOLAH',
        is_verified: false,
      },
      include: {
        sekolah: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // Approve school admin registration
  async verifySchool(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return this.prisma.user.update({
      where: { id },
      data: { is_verified: true, is_active: true }
    });
  }

  // Create Designer Account (Superadmin only)
  async createDesigner(data: { nama: string; email: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        nama: data.nama,
        email: data.email,
        password: hashedPassword,
        role: 'DESIGNER',
        is_admin: false,
        is_verified: true,
        is_active: true,
        id_sekolah: null,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        is_verified: true,
        created_at: true,
      }
    });
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalSekolah = await this.prisma.sekolah.count();
    const totalJadwal = await this.prisma.jadwal.count();
    const totalShare = await this.prisma.sharedLink.count();
    const pendingSchoolsCount = await this.prisma.user.count({
      where: { role: 'ADMIN_SEKOLAH', is_verified: false }
    });

    return { totalUsers, totalSekolah, totalJadwal, totalShare, pendingSchoolsCount };
  }
}

