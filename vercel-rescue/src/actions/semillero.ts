"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// -----------------------------------------------------
// Teacher Actions (Gestión del Semillero)
// -----------------------------------------------------

export async function createProject(data: {
  title: string
  description: string
  category: string
}) {
  const session = await auth()
  if (!session || session.user.role !== "TEACHER") {
    return { error: "No autorizado. Solo profesores pueden crear proyectos." }
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!teacherProfile) return { error: "Perfil de profesor no encontrado." }

  try {
    const project = await prisma.researchProject.create({
      data: {
        title: data.title,
        description: data.description,
        teacherId: teacherProfile.id,
        status: "ACTIVE",
        progress: 0,
      }
    })
    revalidatePath("/dashboard/semillero-age")
    revalidatePath("/semillero-age")
    return { success: true, id: project.id }
  } catch (error) {
    console.error("Error creating project:", error)
    return { error: "Ocurrió un error al crear el proyecto." }
  }
}

export async function getTeacherProjects() {
  const session = await auth()
  if (!session || session.user.role !== "TEACHER") return { error: "No autorizado." }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!teacherProfile) return { error: "Perfil no encontrado." }

  try {
    const projects = await prisma.researchProject.findMany({
      where: { teacherId: teacherProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: true,
        students: {
          include: {
            student: {
              include: { user: true }
            }
          }
        }
      }
    })

    return { success: true, projects }
  } catch (error) {
    console.error("Error fetching teacher projects:", error)
    return { error: "Error al cargar proyectos." }
  }
}

export async function assignStudentByEmail(projectId: string, studentEmail: string) {
  const session = await auth()
  if (!session || session.user.role !== "TEACHER") return { error: "No autorizado." }

  try {
    const studentUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true }
    })

    if (!studentUser) return { error: "No se encontró un estudiante con ese correo." }
    if (studentUser.role !== "STUDENT") return { error: "El correo no pertenece a un estudiante." }
    if (!studentUser.studentProfile) return { error: "No se encontró perfil de estudiante." }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!teacherProfile) return { error: "Perfil de profesor no encontrado." }

    const project = await prisma.researchProject.findUnique({
      where: { id: projectId }
    })

    if (!project || project.teacherId !== teacherProfile.id) {
      return { error: "No eres el director de este proyecto." }
    }

    const existingAssignment = await prisma.researchProjectStudent.findUnique({
      where: {
        projectId_studentId: {
          projectId: projectId,
          studentId: studentUser.studentProfile.id
        }
      }
    })

    if (existingAssignment) return { error: "El estudiante ya está en este proyecto." }

    await prisma.researchProjectStudent.create({
      data: {
        projectId,
        studentId: studentUser.studentProfile.id,
      }
    })

    revalidatePath("/dashboard/semillero-age")
    return { success: true, message: "Estudiante asignado correctamente" }
  } catch (error: any) {
    console.error("Error assigned student:", error)
    return { error: "Error al asignar estudiante." }
  }
}

// -----------------------------------------------------
// Student Actions (Actualización de Proyectos)
// -----------------------------------------------------

export async function getStudentProjects() {
  const session = await auth()
  if (!session || session.user.role !== "STUDENT") return { error: "No autorizado." }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!studentProfile) return { error: "Perfil no encontrado." }

  try {
    const assignments = await prisma.researchProjectStudent.findMany({
      where: { studentId: studentProfile.id },
      include: {
        project: {
          include: {
            tasks: true,
            teacher: {
              include: { user: true }
            }
          }
        }
      }
    })

    const projects = assignments.map(a => a.project);

    return { success: true, projects }
  } catch (error) {
    console.error("Error fetching student projects:", error)
    return { error: "Error al cargar proyectos." }
  }
}

export async function createProjectUpdate(projectId: string, data: {
  title: string
  content: string
  imageUrl?: string
  videoUrl?: string
  documentUrl?: string
}) {
  const session = await auth()
  if (!session) return { error: "No autorizado." }

  try {
    const isAuthorized = await checkProjectAccess(projectId, session.user.id, session.user.role)
    if (!isAuthorized) return { error: "No tienes permisos sobre este proyecto." }

    await prisma.projectUpdate.create({
      data: {
        projectId,
        authorId: session.user.id,
        content: `**${data.title}**\n\n${data.content}`, // Merge title into content if schema doesn't have title
      }
    })
    
    revalidatePath("/dashboard/semillero-age/[id]")
    revalidatePath("/semillero-age/[id]")
    
    return { success: true }
  } catch (error) {
    return { error: "Error al publicar la actualización." }
  }
}

export async function createProjectTask(projectId: string, title: string, description?: string) {
  const session = await auth()
  if (!session) return { error: "No autorizado." }

  try {
    const isAuthorized = await checkProjectAccess(projectId, session.user.id, session.user.role)
    if (!isAuthorized) return { error: "No tienes permisos" }

    await prisma.projectTask.create({
      data: {
        projectId,
        title,
        description: description || "",
        status: "PENDIENTE",
      }
    })
    
    await updateProjectProgress(projectId)
    revalidatePath("/dashboard/semillero-age/[id]")
    return { success: true }
  } catch (error) {
    return { error: "Error al crear tarea." }
  }
}

export async function setTaskStatus(taskId: string, projectId: string, status: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA") {
  const session = await auth()
  if (!session) return { error: "No autorizado." }

  try {
    const isAuthorized = await checkProjectAccess(projectId, session.user.id, session.user.role)
    if (!isAuthorized) return { error: "No tienes permisos" }

    await prisma.projectTask.update({
      where: { id: taskId },
      data: { status }
    })
    
    await updateProjectProgress(projectId)
    revalidatePath("/dashboard/semillero-age/[id]")
    return { success: true }
  } catch (error) {
    return { error: "Error al actualizar tarea." }
  }
}

// -----------------------------------------------------
// Utilidades Compartidas y Vistas Públicas
// -----------------------------------------------------

export async function getAllPublicProjects() {
  try {
    const projects = await prisma.researchProject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { include: { user: true } },
        students: { include: { student: { include: { user: true } } } }
      }
    })
    return { success: true, projects }
  } catch (error) {
    console.error("Error fetching public projects:", error)
    return { error: "Error al cargar proyectos públicos." }
  }
}

export async function getPublicProjectDetails(id: string) {
  try {
    const project = await prisma.researchProject.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        students: { include: { student: { include: { user: true } } } },
        tasks: true,
        updates: { orderBy: { createdAt: 'desc' } }
      }
    })

    if (!project) return { error: "No encontrado" }
    
    return { success: true, project }
  } catch (error) {
    console.error("Error fetching project details:", error)
    return { error: "Error al cargar detalles del proyecto." }
  }
}

// Helper: Recalcula y guarda el porcentaje de progreso de un proyecto (tareas completadas / total tareas)
async function updateProjectProgress(projectId: string) {
  const tasks = await prisma.projectTask.findMany({
    where: { projectId }
  })
  if (tasks.length === 0) return;
  
  const total = tasks.length
  const completed = tasks.filter(t => t.status === "COMPLETADA").length
  const progress = Math.round((completed / total) * 100)
  
  await prisma.researchProject.update({
    where: { id: projectId },
    data: { progress }
  })
}

// Helper: Comprueba si un usuario (profe o est) tiene derecho a alterar un proyecto
async function checkProjectAccess(projectId: string, userId: string, role: string) {
  if (role === "TEACHER") {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId }
    })
    if (!teacherProfile) return false;
    
    const project = await prisma.researchProject.findUnique({
      where: { id: projectId }
    })
    return project?.teacherId === teacherProfile.id
  }
  
  if (role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    })
    if (!studentProfile) return false;

    const assignment = await prisma.researchProjectStudent.findUnique({
      where: {
        projectId_studentId: {
          projectId,
          studentId: studentProfile.id
        }
      }
    })

    return !!assignment
  }
  
  return false
}
