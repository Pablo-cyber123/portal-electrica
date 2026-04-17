"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function upsertGradesAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No autorizado.")
  }

  const enrollmentId = String(formData.get("enrollmentId") || "")
  const subjectId = String(formData.get("subjectId") || "")

  if (!enrollmentId || !subjectId) {
    throw new Error("Datos incompletos.")
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { grades: true }
  })

  if (!enrollment || enrollment.subjectId !== subjectId) {
    throw new Error("Matricula invalida.")
  }

  const cuts = [1, 2, 3]

  for (const cut of cuts) {
    // Buscar notas raw enviadas desde el cliente
    const rawEvalScores: number[] = []
    const rawTasksScores: number[] = []

    formData.forEach((value, key) => {
      if (key.startsWith(`evalScoreCut_${cut}_`)) {
        const val = Number(value)
        if (!isNaN(val)) rawEvalScores.push(val)
      }
      if (key.startsWith(`tasksScoreCut_${cut}_`)) {
        const val = Number(value)
        if (!isNaN(val)) rawTasksScores.push(val)
      }
    })

    if (rawEvalScores.length === 0 && rawTasksScores.length === 0) continue

    const avgEval = rawEvalScores.length > 0 ? rawEvalScores.reduce((a, b) => a + b, 0) / rawEvalScores.length : 0
    const avgTasks = rawTasksScores.length > 0 ? rawTasksScores.reduce((a, b) => a + b, 0) / rawTasksScores.length : 0

    const existingGrade = enrollment.grades.find(g => g.cutNumber === cut)
    const selfEval = existingGrade ? existingGrade.selfEvaluationScore : 0
    
    // Cálculo Final: (Eval Avg * 0.6) + (Task Avg * 0.3) + (Self Eval * 0.1)
    const finalCutScore = (avgEval * 0.6) + (avgTasks * 0.3) + (selfEval * 0.1)

    // UPSERT
    await prisma.grade.upsert({
      where: {
        enrollmentId_cutNumber: {
          enrollmentId,
          cutNumber: cut
        }
      },
      create: {
        enrollmentId,
        cutNumber: cut,
        rawEvaluations: rawEvalScores,
        rawTasks: rawTasksScores,
        evaluationScore: Number(avgEval.toFixed(2)),
        tasksScore: Number(avgTasks.toFixed(2)),
        selfEvaluationScore: selfEval,
        score: Number(finalCutScore.toFixed(2)),
        status: "REGISTRADO_TEACHER"
      },
      update: {
        rawEvaluations: rawEvalScores,
        rawTasks: rawTasksScores,
        evaluationScore: Number(avgEval.toFixed(2)),
        tasksScore: Number(avgTasks.toFixed(2)),
        score: Number(finalCutScore.toFixed(2)),
        status: "REGISTRADO_TEACHER"
      }
    })
  }

  // Update enrollment updated_at
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { updatedAt: new Date() }
  })

  revalidatePath(`/dashboard/subject/${subjectId}`)
}

export async function upsertSelfEvaluationAction(enrollmentId: string, subjectId: string, cutNumber: number, score: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== "STUDENT") throw new Error("No autorizado.")

  if (score < 0 || score > 5) throw new Error("Puntaje inválido.")

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { grades: true }
  })
  
  if (!enrollment) throw new Error("Inscripción no encontrada.")
  
  const existingGrade = enrollment.grades.find(g => g.cutNumber === cutNumber)
  
  const evalScore = existingGrade ? existingGrade.evaluationScore : 0
  const tasksScore = existingGrade ? existingGrade.tasksScore : 0
  
  const finalCutScore = (evalScore * 0.6) + (tasksScore * 0.3) + (score * 0.1)

  await prisma.grade.upsert({
    where: {
      enrollmentId_cutNumber: {
        enrollmentId,
        cutNumber
      }
    },
    create: {
      enrollmentId,
      cutNumber,
      evaluationScore: 0,
      tasksScore: 0,
      selfEvaluationScore: score,
      score: Number(finalCutScore.toFixed(2)),
      status: "REGISTRADO_ESTUDIANTE"
    },
    update: {
      selfEvaluationScore: score,
      score: Number(finalCutScore.toFixed(2)),
    }
  })

  // Update enrollment time
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { updatedAt: new Date() }
  })

  revalidatePath(`/dashboard/subject/${subjectId}`)
}

export async function updateHabilitationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No autorizado.")
  }

  const enrollmentId = String(formData.get("enrollmentId") || "")
  const subjectId = String(formData.get("subjectId") || "")
  const enabled = formData.get("habilitationEnabled") === "on"
  const proofUrl = formData.get("proofUrl")?.toString().trim() || null
  const scoreValue = formData.get("habilitationScore")?.toString()

  if (!enrollmentId || !subjectId) {
    throw new Error("Datos incompletos.")
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { subject: true }
  })

  if (!enrollment || enrollment.subjectId !== subjectId) {
    throw new Error("Matricula invalida.")
  }

  if (session.user.role === "TEACHER") {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!teacherProfile || enrollment.subject.teacherId !== teacherProfile.id) {
      throw new Error("No autorizado.")
    }
  }

  let habilitationScore: number | null = null
  if (scoreValue && scoreValue !== "") {
    const parsed = Number(scoreValue)
    if (!Number.isNaN(parsed)) {
      habilitationScore = parsed
    }
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      habilitationEnabled: enabled,
      habilitationEnabledAt: enabled ? new Date() : null,
      habilitationProofUrl: enabled ? proofUrl : null,
      habilitationScore: enabled ? habilitationScore : null,
    }
  })

  revalidatePath(`/dashboard/subject/${subjectId}`)
}
