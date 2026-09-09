import { Controller, Get, Param, Res, UseGuards, Request } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('pdf')
  async exportPdf(@Request() req: any, @Res() res: Response) {
    const pdfDoc = await this.exportService.generatePdf(req.user.id_sekolah);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=jadwal.pdf');
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Get('excel')
  async exportExcel(@Request() req: any, @Res() res: Response) {
    const buffer = await this.exportService.generateExcel(req.user.id_sekolah);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=jadwal.xlsx');
    
    res.send(buffer);
  }
}
