"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function checkDuplicateDocument(title: string) {
  const document = await prisma.officialDocument.findFirst({
    where: { title }
  });
  return !!document;
}

export async function getDocumentCategories(): Promise<string[]> {
  const documents = await prisma.officialDocument.findMany({
    select: { category: true }
  });
  const cats = new Set(documents.map(doc => doc.category));
  return Array.from(cats).sort() as string[];
}

export async function uploadDocumentAction(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const allowDuplicate = formData.get("allowDuplicate") === "true";

  if (!fileUrl || !title || !category) throw new Error("Faltan campos obligatorios");

  try {
    new URL(fileUrl);
  } catch {
    throw new Error("La URL del documento no es válida");
  }

  if (!allowDuplicate) {
    const isDup = await checkDuplicateDocument(title);
    if (isDup) throw new Error("DUPLICATE_FOUND");
  }

  await prisma.officialDocument.create({
    data: {
      title,
      category,
      fileUrl,
      uploaderId: session.user.id,
    }
  });

  revalidatePath("/documentos");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteDocumentAction(docId: string) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No tienes permisos para eliminar documentos");
  }

  await prisma.officialDocument.delete({
    where: { id: docId }
  });

  revalidatePath("/documentos");
  revalidatePath("/dashboard");

  return { success: true };
}
