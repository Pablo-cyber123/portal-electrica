require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

console.log("Reiniciando y empujando esquema a la base de datos de producción...");
try {
  execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
} catch (e) {
  console.error("Error al hacer force-reset", e);
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
     console.log("Generando contraseñas...");
     const hash = await bcrypt.hash('123456', 10);
     
     console.log("Creando usuarios...");
     const admin = await prisma.user.create({ data: { email: 'admin@uts.edu.co', name: 'Super Admin UTS', role: 'ADMIN', password: hash }});
     const teacher = await prisma.user.create({ data: { email: 'profesor@uts.edu.co', name: 'Ing. Carlos Robles', role: 'TEACHER', password: hash }});
     const student = await prisma.user.create({ data: { email: 'estudiante@uts.edu.co', name: 'Andres Felipe', role: 'STUDENT', password: hash }});

     console.log("Creando perfiles extendidos...");
     const sProfile = await prisma.studentProfile.create({ data: { userId: student.id, code: '12345678', status: 'ACTIVE' }});
     const tProfile = await prisma.teacherProfile.create({ data: { userId: teacher.id, employeeId: 'EMP-001', department: 'Electromecánica' }});

     console.log("Creando materia: Circuitos Electricos I...");
     const subject = await prisma.subject.create({
       data: {
         code: 'ELE-101', 
         name: 'Circuitos Electricos I', 
         description: 'Fundamentos de electricidad',
         teacherId: tProfile.id, 
         credits: 3, 
         semester: 1
       }
     });

     console.log("Inscribiendo estudiante a la materia...");
     const enrollment = await prisma.enrollment.create({
       data: { subjectId: subject.id, studentId: sProfile.id, teacherId: tProfile.id, status: 'ENROLLED' }
     });

     console.log("Creando calificacion (Primer Corte)...");
     await prisma.grade.create({
       data: { 
         enrollmentId: enrollment.id, 
         cutNumber: 1, 
         rawEvaluations: [4.0], 
         rawTasks: [4.5], 
         evaluationScore: 4.0, 
         tasksScore: 4.5, 
         selfEvaluationScore: 4.2, 
         score: 4.2, 
         status: 'PUBLISHED' 
       }
     });

     console.log("Seeding completado satisfactoriamente!");
  } catch(e) {
     console.error("Error durante el seeding", e);
  } finally {
     await prisma.$disconnect();
     pool.end();
  }
}
seed();
