import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DegreeProjectStudentPanel } from "@/components/dashboard/DegreeProjectStudentPanel"
import { DegreeProjectTeacherPanel } from "@/components/dashboard/DegreeProjectTeacherPanel"

export const dynamic = "force-dynamic"

const DEFAULT_PROJECT_DEADLINE = new Date("2026-05-30T23:59:59-05:00")

export default async function ProyectoGradoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const { role, id } = session.user

  // Lógica para DOCENTES
  if (role === "TEACHER") {
    const ideas = await prisma.degreeProjectIdea.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        student: {
          include: { user: true }
        }
      }
    })

    const viewIdeas = ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      status: idea.status,
      documentUrl: idea.documentUrl,
      fileName: idea.fileName,
      submittedAt: new Date(idea.submittedAt).toISOString(),
      updatedAt: new Date(idea.updatedAt).toISOString(),
      teacherFeedback: idea.teacherFeedback,
      studentName: idea.student.user.name || "Estudiante",
      studentCode: idea.student.code || "---",
    }))

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-oxfordGrey-900">Gestión de Proyectos de Grado</h1>
          <p className="text-sm text-oxfordGrey-500">Revisa y califica las propuestas iniciales enviadas por los estudiantes.</p>
        </div>
        <DegreeProjectTeacherPanel ideas={viewIdeas} />
      </div>
    )
  }

  // Lógica para ESTUDIANTES
  if (role !== "STUDENT") {
    return (
      <div className="text-sm text-oxfordGrey-500 p-6">
        Esta vista esta disponible solo para estudiantes y profesores.
      </div>
    )
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: id }
  })

  if (!studentProfile) {
    return <p className="text-sm text-oxfordGrey-500 p-6">Perfil de estudiante no encontrado.</p>
  }

  const profileId = studentProfile.id

  const activeProjectWindow = await prisma.degreeProjectSubmissionWindow.findFirst({
    where: { isActive: true },
    orderBy: { submissionDeadline: 'asc' }
  })

  const deadline = activeProjectWindow?.submissionDeadline 
    ? new Date(activeProjectWindow.submissionDeadline)
    : DEFAULT_PROJECT_DEADLINE

  const diffMs = deadline.getTime() - Date.now()
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  const canSubmit = diffMs > 0

  const idea = await prisma.degreeProjectIdea.findUnique({
    where: { studentId: profileId }
  })

  let reviewedByName = null
  if (idea?.reviewedByUserId) {
    const reviewerUser = await prisma.user.findUnique({ where: { id: idea.reviewedByUserId } })
    reviewedByName = reviewerUser?.name || null
  }

  const studentProjectIdea = idea
    ? {
        id: idea.id,
        title: idea.title,
        summary: idea.summary,
        documentUrl: idea.documentUrl,
        fileName: idea.fileName,
        status: idea.status,
        teacherFeedback: idea.teacherFeedback,
        submittedAt: new Date(idea.submittedAt).toISOString(),
        reviewedAt: idea.reviewedAt ? new Date(idea.reviewedAt).toISOString() : null,
        reviewedByName: reviewedByName,
      }
    : null

  const notifications = await prisma.studentNotification.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  const studentNotifications = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: new Date(n.createdAt).toISOString(),
  }))

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-black text-oxfordGrey-900">Proyecto de Grado</h1>
         <p className="text-sm text-oxfordGrey-500">Sigue el estado de tu propuesta de grado y comunicación con evaluadores.</p>
       </div>
       <DegreeProjectStudentPanel
         deadlineText={deadline.toLocaleDateString("es-CO", {
           year: "numeric",
           month: "long",
           day: "numeric",
         })}
         daysRemaining={daysRemaining}
         canSubmit={canSubmit}
         idea={studentProjectIdea}
         notifications={studentNotifications}
       />
    </div>
  )
}
