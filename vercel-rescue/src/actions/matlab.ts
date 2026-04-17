"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMatlabProject(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const functionality = formData.get("functionality") as string;
  const code = formData.get("code") as string;
  const fileName = formData.get("fileName") as string;

  if (!title || !description || !functionality || !code || !fileName) {
    throw new Error("Todos los campos son obligatorios");
  }

  await prisma.matlabProject.create({
    data: {
      title,
      description,
      functionality,
      code,
      fileName,
      uploaderId: session.user.id,
    }
  });

  revalidatePath("/dashboard/subir-matlab");
  revalidatePath("/dashboard/herramientas");

  return { success: true };
}

export async function getMatlabProjects() {
  const projects = await prisma.matlabProject.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      functionality: true,
      fileName: true,
      createdAt: true,
    }
  });

  return projects;
}

export async function getMatlabProject(id: string) {
  const session = await auth();
  if (!session) throw new Error("No autenticado");

  const project = await prisma.matlabProject.findUnique({
    where: { id }
  });

  if (!project) throw new Error("Proyecto no encontrado");

  return project;
}

export async function deleteMatlabProject(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("No tienes permisos para eliminar proyectos");
  }

  await prisma.matlabProject.delete({
    where: { id }
  });

  revalidatePath("/dashboard/subir-matlab");
  revalidatePath("/dashboard/herramientas");

  return { success: true };
}
