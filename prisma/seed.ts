import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('ContrasenaSegura123', 10)

  // 1. Crear ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@uts.edu.co' },
    update: {},
    create: {
      email: 'admin@uts.edu.co',
      name: 'Super Admin UTS',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  // 2. Crear PROFESOR
  const teacherUser = await prisma.user.upsert({
    where: { email: 'profesor@uts.edu.co' },
    update: {},
    create: {
      email: 'profesor@uts.edu.co',
      name: 'Ing. Carlos Robles',
      password: passwordHash,
      role: 'TEACHER',
      teacherProfile: {
        create: {
          employeeId: 'DOC-1020',
          department: 'Ingeniería Eléctrica'
        }
      }
    },
  })

  // 3. Crear ESTUDIANTE
  const studentUser = await prisma.user.upsert({
    where: { email: 'estudiante@uts.edu.co' },
    update: {},
    create: {
      email: 'estudiante@uts.edu.co',
      name: 'Andrés Felipe',
      password: passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          code: '202021001',
          status: 'ACTIVE'
        }
      }
    },
  })

  // 4. Crear Materia
  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: teacherUser.id } })
  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } })

  if (teacherProfile && studentProfile) {
    const subject = await prisma.subject.upsert({
      where: { code: 'ELE-101' },
      update: {},
      create: {
        code: 'ELE-101',
        name: 'Circuitos Eléctricos I',
        credits: 4,
        teacherId: teacherProfile.id
      }
    })

    // Enrolar Estudiante
    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_subjectId: {
          studentId: studentProfile.id,
          subjectId: subject.id,
        }
      },
      update: {},
      create: {
        studentId: studentProfile.id,
        subjectId: subject.id,
        period: '2026-1'
      }
    })

    // Crear unas notas de prueba
    await prisma.grade.create({
      data: {
        enrollmentId: enrollment.id,
        cutNumber: 1,
        score: 4.5,
        observation: 'Buen trabajo en nodos',
        status: 'FROZEN'
      }
    })
  }

  // 5. Crear una Noticia
  await prisma.newsArticle.create({
    data: {
      title: 'Semana de la Ingeniería Eléctrica 2026',
      content: 'Bienvenidos a la semana de la ingeniería, habrán conferencias y proyectos en exhibición.',
      authorId: admin.id,
      published: true
    }
  })

  await prisma.newsArticle.create({
    data: {
      title: 'Nuevo Laboratorio de Circuitos',
      content: 'La Escuela inaugurará este semestre el nuevo laboratorio de circuitos de potencia y simulación.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
      authorId: teacherUser.id,
      published: true
    }
  })

  await prisma.newsArticle.create({
    data: {
      title: 'Calendario Académico Modificado',
      content: 'Se han ajustado las fechas para los parciales del tercer corte. Revisen el enlace adjunto.',
      linkUrl: 'https://www.uts.edu.co/sitio/calendario-academico/',
      authorId: admin.id,
      published: true
    }
  })

  console.log('Seed completado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
