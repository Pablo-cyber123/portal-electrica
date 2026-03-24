"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  subjectId: z.string().min(1)
})

export async function createAnnouncementAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado para publicar anuncios.")
  }

  const result = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    subjectId: formData.get("subjectId")
  })

  if (!result.success) {
    throw new Error("Datos de formulario inválidos.")
  }

  // Verifica que el profesor enseña esta materia
  const subject = await prisma.subject.findUnique({
    where: { id: result.data.subjectId },
    include: { teacher: true }
  })

  if (!subject || subject.teacher.userId !== session.user.id) {
    throw new Error("No autorizado para publicar en esta materia.")
  }

  await prisma.subjectAnnouncement.create({
    data: {
      title: result.data.title,
      content: result.data.content,
      subjectId: result.data.subjectId,
      authorId: session.user.id
    }
  })

  revalidatePath(`/dashboard/subject/${result.data.subjectId}`)
  return { success: true }
}

export async function deleteAnnouncementAction(id: string, subjectId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado.")
  }

  const announcement = await prisma.subjectAnnouncement.findUnique({
    where: { id },
    include: { subject: { include: { teacher: true } } }
  })

  if (!announcement || announcement.subject.teacher.userId !== session.user.id) {
    throw new Error("No autorizado para eliminar este anuncio.")
  }

  await prisma.subjectAnnouncement.delete({
    where: { id }
  })

  revalidatePath(`/dashboard/subject/${subjectId}`)
  return { success: true }
}
