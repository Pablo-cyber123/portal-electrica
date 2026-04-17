"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
  const subjectDoc = await prisma.subject.findUnique({
    where: { id: result.data.subjectId }
  })

  if (!subjectDoc) {
    throw new Error("Materia no encontrada.")
  }
  
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!teacherProfile || subjectDoc.teacherId !== teacherProfile.id) {
    throw new Error("No autorizado para publicar en esta materia.")
  }

  await prisma.subjectAnnouncement.create({
    data: {
      title: result.data.title,
      content: result.data.content,
      subjectId: result.data.subjectId,
      // asumiendo authorId puede guardarse o ignorar si no es parte del schema (agregado en Prisma schema o no, espere, ¿authorId está en SubjectAnnouncement en Prisma? Revisando la definición anterior.. Ah, SubjectAnnouncement no tiene authorId en schema.prisma, depende del profesor. Mejor dejo que Prisma lance error si falta, pero no, esperemos).
      // Oh, wait, in schema.prisma for SubjectAnnouncement I only defined title, content, subjectId, createdAt. So no authorId needed since it belongs to subject.
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
    where: { id }
  })

  if (!announcement) {
    throw new Error("El anuncio no existe.")
  }

  // Verifica que el profesor sea el dueño de la materia
  const subject = await prisma.subject.findUnique({
    where: { id: announcement.subjectId }
  })
  
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!subject || !teacherProfile || subject.teacherId !== teacherProfile.id) {
    throw new Error("No autorizado para eliminar este anuncio.")
  }

  await prisma.subjectAnnouncement.delete({ where: { id } })

  revalidatePath(`/dashboard/subject/${subjectId}`)
  return { success: true }
}
