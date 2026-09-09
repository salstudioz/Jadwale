import { Module } from '@nestjs/common';
import { JadwalController } from './jadwal.controller';
import { JadwalService } from './jadwal.service';
import { JadwalGateway } from './jadwal.gateway';
import { PrismaModule } from '../prisma/prisma.module';

import { BullModule } from '@nestjs/bullmq';
import { JadwalProcessor } from './jadwal.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'generate-jadwal',
    }),
  ],
  controllers: [JadwalController],
  providers: [JadwalService, JadwalGateway, JadwalProcessor]
})
export class JadwalModule {}
