"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath, unstable_noStore } from "next/cache"
import { z } from "zod"
import { writeFile } from "fs/promises"
import path from "path"

const NewsSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal('')),
  linkUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
})

export async function createNewsAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    throw new Error("No autorizado para crear noticias.")
  }

  const result = NewsSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
  })

  if (!result.success) {
    throw new Error("Datos inválidos")
  }

  // Handle local File Upload if present
  const imageFile = formData.get("imageFile") as File | null
  let uploadedImageUrl = result.data.imageUrl || null

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generar nombre seguro
    const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`
    const filepath = path.join(process.cwd(), "public/uploads", filename)
    
    await writeFile(filepath, buffer)
    uploadedImageUrl = `/uploads/${filename}`
  }

  await prisma.news.create({
    data: {
      title: result.data.title,
      content: result.data.content,
      imageUrl: uploadedImageUrl,
      linkUrl: result.data.linkUrl || null,
      videoUrl: result.data.videoUrl || null,
      authorId: session.user?.id || 'unknown',
      published: true,
      createdAt: new Date(),
    }
  })

  revalidatePath("/") 
  return { success: true }
}

export async function deleteNewsAction(id: string) {
  const session = await auth()
  
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    throw new Error("No autorizado para eliminar noticias.")
  }

  await prisma.news.delete({ where: { id } })

  revalidatePath("/") 
  revalidatePath("/noticias")
  return { success: true }
}

export async function getPublicNews() {
  unstable_noStore();
  
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return news.map((item) => {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      videoUrl: item.videoUrl,
      date: item.createdAt.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    }
  })
}

export async function getAllPublicNews() {
  unstable_noStore();
  
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return news.map((item) => {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      videoUrl: item.videoUrl,
      date: item.createdAt.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    }
  })
}
