import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(id_sekolah: number): Promise<PDFKit.PDFDocument> {
    const sekolah = await this.prisma.sekolah.findUnique({ where: { id: id_sekolah } });
    const jadwal = await this.prisma.jadwal.findMany({
      where: { id_sekolah },
      include: { kelas: true, mapel: true, guru: true },
      orderBy: [{ hari: 'asc' }, { jam_ke: 'asc' }]
    });

    const docDefinition: any = {
      content: [
        { text: `Jadwal Pelajaran - ${sekolah?.nama_sekolah || 'Sekolah'}`, style: 'header' },
        { text: 'Dibuat secara otomatis oleh Jadwale', margin: [0, 0, 0, 20] },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    // Grouping jadwal by kelas
    const jadwalPerKelas = jadwal.reduce((acc, curr) => {
      if (!acc[curr.id_kelas]) acc[curr.id_kelas] = { nama: curr.kelas.nama_kelas, data: [] };
      acc[curr.id_kelas].data.push(curr);
      return acc;
    }, {} as any);

    for (const idKelas in jadwalPerKelas) {
      const k = jadwalPerKelas[idKelas];
      docDefinition.content.push({ text: `Kelas: ${k.nama}`, style: 'subheader', margin: [0, 10, 0, 5] });
      
      const tableBody = [
        ['Hari', 'Jam Ke', 'Mata Pelajaran', 'Guru']
      ];
      
      for (const item of k.data) {
        const namaHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][item.hari - 1] || item.hari;
        tableBody.push([
          namaHari,
          item.jam_ke.toString(),
          item.mapel.nama,
          item.guru.nama
        ]);
      }

      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*'],
          body: tableBody
        }
      });
    }

    return pdfMake.createPdf(docDefinition).getStream();
  }

  async generateExcel(id_sekolah: number): Promise<Buffer> {
    const sekolah = await this.prisma.sekolah.findUnique({ where: { id: id_sekolah } });
    const jadwal = await this.prisma.jadwal.findMany({
      where: { id_sekolah },
      include: { kelas: true, mapel: true, guru: true },
      orderBy: [{ hari: 'asc' }, { jam_ke: 'asc' }]
    });

    const workbook = new ExcelJS.Workbook();
    
    // Grouping by kelas
    const jadwalPerKelas = jadwal.reduce((acc, curr) => {
      if (!acc[curr.id_kelas]) acc[curr.id_kelas] = { nama: curr.kelas.nama_kelas, data: [] };
      acc[curr.id_kelas].data.push(curr);
      return acc;
    }, {} as any);

    for (const idKelas in jadwalPerKelas) {
      const k = jadwalPerKelas[idKelas];
      const sheetName = k.nama.replace(/[\\/?*\[\]]/g, ''); // excel sheet name constraint
      const worksheet = workbook.addWorksheet(sheetName.substring(0, 31));
      
      worksheet.columns = [
        { header: 'Hari', key: 'hari', width: 15 },
        { header: 'Jam Ke', key: 'jam', width: 10 },
        { header: 'Mata Pelajaran', key: 'mapel', width: 30 },
        { header: 'Guru', key: 'guru', width: 30 },
      ];
      
      for (const item of k.data) {
        const namaHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][item.hari - 1] || item.hari;
        worksheet.addRow({
          hari: namaHari,
          jam: item.jam_ke,
          mapel: item.mapel.nama,
          guru: item.guru.nama
        });
      }
    }

    if (Object.keys(jadwalPerKelas).length === 0) {
      workbook.addWorksheet('Jadwal Kosong');
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any as Buffer;
  }
}
