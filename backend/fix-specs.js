const fs = require('fs');
const path = require('path');

const filesToFix = [
  'sekolah/sekolah.service.spec.ts',
  'sekolah/sekolah.controller.spec.ts',
  'mapel/mapel.service.spec.ts',
  'mapel/mapel.controller.spec.ts',
  'kelas/kelas.service.spec.ts',
  'kelas/kelas.controller.spec.ts',
  'jadwal/jadwal.service.spec.ts',
  'jadwal/jadwal.controller.spec.ts',
  'guru/guru.service.spec.ts',
  'guru/guru.controller.spec.ts',
  'auth/auth.service.spec.ts',
  'auth/auth.controller.spec.ts'
];

const basePath = 'd:\\project\\Jadwale\\backend\\src';

filesToFix.forEach(relPath => {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Skip if already mocked
  if (content.includes('provide: PrismaService')) return;

  const depth = relPath.split('/').length - 1;
  const prismaPath = depth === 0 ? './prisma/prisma.service' : '../'.repeat(depth) + 'prisma/prisma.service';

  let importsToAdd = `import { PrismaService } from '${prismaPath}';\n`;
  if (relPath.includes('auth')) {
    importsToAdd += `import { JwtService } from '@nestjs/jwt';\n`;
  }

  content = content.replace("import { Test, TestingModule } from '@nestjs/testing';", 
    `import { Test, TestingModule } from '@nestjs/testing';\n${importsToAdd}`);

  // Find the class being tested
  const providersMatch = content.match(/providers: \[([a-zA-Z]+)\]/);
  const controllersMatch = content.match(/controllers: \[([a-zA-Z]+)\]/);
  
  if (providersMatch) {
    let newProviders = `providers: [${providersMatch[1]}, { provide: PrismaService, useValue: {} }`;
    if (relPath.includes('auth.service')) {
       newProviders += `, { provide: JwtService, useValue: {} }`;
    }
    newProviders += `]`;
    content = content.replace(providersMatch[0], newProviders);
  }

  // Controllers don't usually need their own PrismaService if the Service is injected,
  // but if the controller has providers, we might need to inject the Service or PrismaService.
  // Wait, default controller spec has: controllers: [XController], providers: [XService]
  const controllerProviderMatch = content.match(/providers: \[([a-zA-Z]+Service)\]/);
  if (controllerProviderMatch) {
    let newProviders = `providers: [${controllerProviderMatch[1]}, { provide: PrismaService, useValue: {} }`;
    if (relPath.includes('auth.controller')) {
       newProviders += `, { provide: JwtService, useValue: {} }`;
    }
    newProviders += `]`;
    content = content.replace(controllerProviderMatch[0], newProviders);
  }
  
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', relPath);
});
