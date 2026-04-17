"use server"

import fs from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_PROJECT_IDEA_EXTENSIONS = [".pdf", ".doc", ".docx"]
const DEFAULT_PROJECT_DEADLINE = new Date("2026-05-30T23:59:59-05:00")

function getStatusMessage(status: string) {
  switch (status) {
    case "EN_REVISION":
      return "Tu idea de proyecto de grado ahora esta en revision."
    case "APROBADA":
      return "Tu idea de proyecto de grado fue aprobada."
    case "REQUIERE_AJUSTES":
      return "Tu idea de proyecto de grado requiere ajustes."
    case "RECHAZADA":
      return "Tu idea de proyecto de grado fue rechazada."
    default:
      return "El estado de tu idea de proyecto de grado fue actualizado."
  }
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
}

async function ensureStudentSession() {
  const session = await auth()
  if (!session?.user || session.user.role !== "STUDENT") {
    throw new Error("No autorizado.")
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    throw new Error("Perfil de estudiante no encontrado.")
  }

  return { session, profile }
}

async function ensureTeacherSession() {
  const session = await auth()
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado.")
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!profile) {
    throw new Error("Perfil de profesor no encontrado.")
  }

  return { session, profile }
}

async function getOrCreateActiveSubmissionWindow() {
  const window = await prisma.degreeProjectSubmissionWindow.findFirst({
    where: { isActive: true },
    orderBy: { submissionDeadline: "asc" }
  })

  if (window) {
    return window;
  }

  const newWindow = await prisma.degreeProjectSubmissionWindow.create({
    data: {
      title: "Entrega idea de proyecto de grado",
      submissionDeadline: DEFAULT_PROJECT_DEADLINE,
      isActive: true,
    }
  })
  
  return newWindow;
}

export async function submitDegreeProjectIdeaAction(formData: FormData) {
  const { profile } = await ensureStudentSession()

  const activeWindow = await getOrCreateActiveSubmissionWindow()

  if (new Date() > activeWindow.submissionDeadline) {
    throw new Error("La fecha limite para subir la idea ya vencio.")
  }

  const title = String(formData.get("title") || "").trim()
  const summary = String(formData.get("summary") || "").trim()
  const file = formData.get("file") as File | null

  if (title.length < 10) {
    throw new Error("El titulo debe tener al menos 10 caracteres.")
  }

  if (summary.length < 30) {
    throw new Error("El resumen debe tener al menos 30 caracteres.")
  }

  if (!file || file.size === 0) {
    throw new Error("Debes adjuntar el documento de la idea.")
  }

  const extension = path.extname(file.name).toLowerCase()
  if (!ALLOWED_PROJECT_IDEA_EXTENSIONS.includes(extension)) {
    throw new Error("Solo se permiten archivos PDF, DOC y DOCX.")
  }

  const uploadDir = path.join(process.cwd(), "public", "documentos", "proyecto-grado")
  await fs.mkdir(uploadDir, { recursive: true })

  const safeFileName = `${Date.now()}-${normalizeFileName(file.name)}`
  const filePath = path.join(uploadDir, safeFileName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  // Usamos upsert para actualizar o crear
  await prisma.degreeProjectIdea.upsert({
    where: { id: profile.id },
    create: {
      id: profile.id, // Forzamos a que el id coincida o sea la PK
      studentId: profile.id,
      title,
      summary,
      documentUrl: `/documentos/proyecto-grado/${safeFileName}`,
      fileName: file.name,
      status: "PENDIENTE_REVISION",
    },
    update: {
      title,
      summary,
      documentUrl: `/documentos/proyecto-grado/${safeFileName}`,
      fileName: file.name,
      status: "PENDIENTE_REVISION",
      teacherFeedback: null,
      reviewedByUserId: null,
      reviewedAt: null,
      submittedAt: new Date()
    }
  })

  revalidatePath("/dashboard")
}

export async function updateDegreeProjectIdeaStatusAction(formData: FormData) {
  const { session } = await ensureTeacherSession()

  const ideaId = String(formData.get("ideaId") || "")
  const status = String(formData.get("status") || "")
  const feedback = String(formData.get("feedback") || "").trim()

  const allowedStatuses = [
    "PENDIENTE_REVISION",
    "EN_REVISION",
    "APROBADA",
    "REQUIERE_AJUSTES",
    "RECHAZADA"
  ]

  if (!ideaId) {
    throw new Error("Idea no valida.")
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Estado no valido.")
  }

  const ideaDoc = await prisma.degreeProjectIdea.findUnique({
    where: { id: ideaId },
    include: { student: true }
  })

  if (!ideaDoc) {
    throw new Error("No se encontro la idea de proyecto.")
  }

  // Transaction for updating idea state and creating notification
  await prisma.$transaction(async (tx) => {
    await tx.degreeProjectIdea.update({
      where: { id: ideaId },
      data: {
        status,
        teacherFeedback: feedback || null,
        reviewedByUserId: session.user.id,
        reviewedAt: new Date(),
      }
    })

    await tx.studentNotification.create({
      data: {
        userId: ideaDoc.student.userId,
        ideaId: ideaId,
        title: "Cambio de estado en tu idea de grado",
        message: feedback
          ? `${getStatusMessage(status)} Observacion del profesor: ${feedback}`
          : getStatusMessage(status),
        isRead: false,
      }
    })
  })

  revalidatePath("/dashboard")
}

export async function markStudentNotificationAsReadAction(notificationId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("No autorizado.")
  }

  const notification = await prisma.studentNotification.findUnique({
    where: { id: notificationId }
  })

  if (!notification || notification.userId !== session.user.id) {
    throw new Error("No autorizado para editar esta notificacion.")
  }

  await prisma.studentNotification.update({
    where: { id: notificationId },
    data: { isRead: true }
  })

  revalidatePath("/dashboard")
}
