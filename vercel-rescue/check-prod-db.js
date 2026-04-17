require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const users = await prisma.user.count().catch(() => "Error");
    const subjects = await prisma.subject.count().catch(() => "Error");
    const grades = await prisma.grade.count().catch(() => "Error");
    const enrollments = await prisma.enrollment.count().catch(() => "Error");
    
    // Some samples
    const sampleUsers = await prisma.user.findMany({ take: 3, select: { email: true, name: true, role: true } }).catch(() => []);
    const sampleSubjects = await prisma.subject.findMany({ take: 3, select: { name: true, code: true } }).catch(() => []);

    console.log("=== DATOS ACTUALES DE PRODUCCION ===");
    console.log(`Cantidad de Usuarios: ${users}`);
    console.table(sampleUsers);
    console.log(`Cantidad de Materias: ${subjects}`);
    console.table(sampleSubjects);
    console.log(`Cantidad de Inscripciones: ${enrollments}`);
    console.log(`Cantidad de Calificaciones: ${grades}`);

  } catch(e) {
    console.error("Error global", e);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}
check();
