"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function enrollInSubjectAction(subjectId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Debes iniciar sesión.")
  if (session.user.role !== "STUDENT") throw new Error("Solo los estudiantes pueden inscribirse.")

  // 1. Obtener perfil del estudiante
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  })
  
  if (!studentProfile) throw new Error("Perfil de estudiante no encontrado.")

  // 2. Verificar si la materia existe
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  })
  
  if (!subject) throw new Error("La materia no existe.")

  // 3. Verificar si ya está inscrito
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_subjectId: {
        studentId: studentProfile.id,
        subjectId: subjectId
      }
    }
  })
  
  if (existingEnrollment) {
    return { success: true, message: "Ya estás inscrito en esta materia." }
  }

  // 4. Crear inscripción y las notas iniciales en una transacción
  await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.create({
      data: {
        studentId: studentProfile.id,
        subjectId: subjectId,
        teacherId: subject.teacherId, // Denormalización
      }
    })

    // Crear cortes vacíos (1, 2, 3)
    await tx.grade.createMany({
      data: [
        { cutNumber: 1, enrollmentId: enrollment.id, evaluationScore: 0, tasksScore: 0, selfEvaluationScore: 0, score: 0, status: "PENDIENTE" },
        { cutNumber: 2, enrollmentId: enrollment.id, evaluationScore: 0, tasksScore: 0, selfEvaluationScore: 0, score: 0, status: "PENDIENTE" },
        { cutNumber: 3, enrollmentId: enrollment.id, evaluationScore: 0, tasksScore: 0, selfEvaluationScore: 0, score: 0, status: "PENDIENTE" }
      ]
    })
  })

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/subject/${subjectId}`)
  
  return { success: true, message: "Inscripción exitosa." }
}
