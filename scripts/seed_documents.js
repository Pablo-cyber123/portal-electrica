const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const cleanNameDisplay = (name, isFolder = false) => {
  let clean = name.replace(/^\d+\.\s*/, '');
  let ext = '';
  
  if (!isFolder) {
    const parts = clean.split('.');
    if (parts.length > 1) {
      ext = '.' + parts.pop();
      clean = parts.join('.');
    }
    
    clean = clean.replace(/^[A-Z]-[A-Z]+-\d+\s*/i, '');
    clean = clean.replace(/\s*[vV]\d+\.?$/i, '');
    clean = clean.replace(/[_-]/g, ' ');
  }
  
  clean = clean.trim();
  clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  
  if (clean.includes('Documentos de grado')) clean = 'Documentos de Grado';
  if (clean.includes('direccionamiento estratEgico')) clean = 'Direccionamiento Estratégico';
  
  return clean + (ext ? ext.toLowerCase() : '');
};

const OFFICIAL_LINKS = [
  { title: "Calendario Académico", url: "https://www.uts.edu.co/sitio/calendario-academico" },
  { title: "Reglamento Estudiantil", url: "https://www.uts.edu.co/sitio/wp-content/uploads/2019/10/REGLAMENTO_ESTUDIANTIL_ENERO_2022.pdf" },
  { title: "Reglamento Disciplinario Estudiantil", url: "https://www.uts.edu.co/sitio/acuerdo-no-01-009-actualizacion-reglamento-disciplinario-estudiantil/" },
  { title: "Estatuto Docente", url: "https://www.uts.edu.co/sitio/wp-content/uploads/normatividad/estatuto_docente.pdf" },
  { title: "Reglamento Disciplinario Docente", url: "https://www.uts.edu.co/sitio/wp-content/uploads/normatividad/reglamento_disciplinario_docente.pdf" },
  { title: "Estatuto General", url: "https://www.uts.edu.co/sitio/wp-content/uploads/normatividad/estatuto_general.pdf" },
  { title: "Reglamento Trabajo de Grado", url: "https://www.uts.edu.co/sitio/wp-content/uploads/normatividad/acuerdos/acu-73.pdf?_t=1629462746" },
  { title: "Modelo de Bienestar Institucional", url: "https://www.uts.edu.co/sitio/wp-content/uploads/normatividad/acuerdos/acu-37.pdf?_t=1582322783" },
  { title: "Manual de Contratación", url: "https://www.uts.edu.co/sitio/wp-content/uploads/normatividad/resoluciones/res-224.PDF?_t=1641917172" },
  { title: "Reglamento operativo política gratuidad", url: "https://www.uts.edu.co/sitio/comunicado-nuevo-reglamento-operativo-politica-de-gratuidad-en-la-matricula-2024/" }
];

async function seed() {
  console.log("Cleaning OfficialDocument table...");
  await prisma.officialDocument.deleteMany({});

  const docsPath = path.join(__dirname, '..', 'public', 'documentos', 'base-documental');
  
  const processDirectory = async (currentPath, category = "General") => {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      if (item.startsWith('.')) continue;
      
      const fullPath = path.join(currentPath, item);
      const isDir = fs.statSync(fullPath).isDirectory();
      
      if (isDir) {
        await processDirectory(fullPath, cleanNameDisplay(item, true));
      } else {
        const title = cleanNameDisplay(item, false);
        const relUrl = `/documentos/base-documental${fullPath.split('base-documental')[1].replace(/\\/g, '/')}`;
        
        await prisma.officialDocument.create({
          data: {
            title,
            category,
            fileUrl: relUrl
          }
        });
      }
    }
  };

  console.log("Seeding local documents...");
  await processDirectory(docsPath);

  console.log("Seeding official UTS links...");
  for (const link of OFFICIAL_LINKS) {
    await prisma.officialDocument.create({
      data: {
        title: link.title,
        category: "Normatividad UTS",
        fileUrl: link.url
      }
    });
  }

  console.log("Done seeding documents.");
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
