"use server"

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function checkDuplicateDocument(title: string) {
  const existing = await prisma.officialDocument.findFirst({
    where: { title }
  });
  return !!existing;
}

export async function getDocumentCategories(): Promise<string[]> {
  const docs = await prisma.officialDocument.findMany({ select: { category: true } });
  const cats = new Set(docs.map((d: { category: string }) => d.category));
  return Array.from(cats).sort() as string[];
}

export async function uploadDocumentAction(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const file = formData.get("file") as File;
  const allowDuplicate = formData.get("allowDuplicate") === "true";
  
  if (!file || !title || !category) throw new Error("Faltan campos obligatorios");

  if (!allowDuplicate) {
    const isDup = await checkDuplicateDocument(title);
    if (isDup) throw new Error("DUPLICATE_FOUND");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const uploadDir = path.join(process.cwd(), "public", "documentos", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  const fileUrl = `/documentos/uploads/${filename}`;

  await prisma.officialDocument.create({
    data: {
      title,
      category,
      fileUrl,
      uploaderId: session.user.id
    }
  });

  revalidatePath("/documentos");
  revalidatePath("/dashboard");
  
  return { success: true };
}
