import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SekolahModule } from './sekolah/sekolah.module';
import { GuruModule } from './guru/guru.module';
import { KelasModule } from './kelas/kelas.module';
import { MapelModule } from './mapel/mapel.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { ExportModule } from './export/export.module';
import { ShareModule } from './share/share.module';
import { AdminModule } from './admin/admin.module';
import { TemplateModule } from './template/template.module';

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: new (require('ioredis-mock'))(),
    }),
    PrismaModule, AuthModule, SekolahModule, GuruModule, KelasModule, MapelModule, JadwalModule, ExportModule, ShareModule, AdminModule, TemplateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
