import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsEditor } from "@/components/news/NewsEditor"
import { DeleteNewsButton } from "@/components/news/DeleteNewsButton"
import { Activity, Book, GraduationCap, Users, FileText, FileUp, Calendar, User, ChevronRight } from "lucide-react"
import { DocumentUploader } from "@/components/documents/DocumentUploader"
import Link from "next/link"
import { DegreeProjectStudentPanel } from "@/components/dashboard/DegreeProjectStudentPanel"
import { DegreeProjectTeacherPanel } from "@/components/dashboard/DegreeProjectTeacherPanel"
import { FacebookSettingsCard } from "@/components/news/FacebookSettingsCard"
import { getFacebookSettingsAction } from "@/actions/facebook-settings"

export const dynamic = "force-dynamic"
const DEFAULT_PROJECT_DEADLINE = new Date("2026-05-30T23:59:59-05:00")

export default async function DashboardHome() {
  try {
    return await DashboardHomeInner()
  } catch (err: any) {
    console.error("DASHBOARD RENDER ERROR:", err)
    return (
      <div className="min-h-screen flex items-center justify-center bg-oxfordGrey-50 text-red-600 p-8">
        <div className="max-w-2xl bg-white p-6 rounded-lg shadow-xl font-mono text-sm border-l-4 border-red-600 w-full">
          <h1 className="text-xl font-bold mb-4">Error 500 - Debug Dashboard</h1>
          <pre className="whitespace-pre-wrap word-break">{err.stack || err.message || String(err)}</pre>
        </div>
      </div>
    )
  }
}

async function DashboardHomeInner() {
  const session = await auth()
  
  if (!session) return null
  const { role, id } = session.user

  interface StatItem {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
  }

  let stats: StatItem[] = []

  let studentEnrollments: any[] = []
  let studentRecentGrades: any[] = []
  let teacherSubjects: any[] = []
  let projectIdeaDeadline: Date | null = null
  let projectIdeaDaysRemaining = 0
  let canSubmitProjectIdea = false
  let studentProjectIdea: any = null
  let studentNotifications: any[] = []
  let teacherProjectIdeas: any[] = []

  // 1. Paralelismo Inicial
  const [activeProjectWindow, studentProfile, teacherProfile] = await Promise.all([
    prisma.degreeProjectSubmissionWindow.findFirst({
      where: { isActive: true },
      orderBy: { submissionDeadline: "asc" }
    }),
    role === "STUDENT" ? prisma.studentProfile.findUnique({ where: { userId: id } }) : Promise.resolve(null),
    role === "TEACHER" ? prisma.teacherProfile.findUnique({ where: { userId: id } }) : Promise.resolve(null)
  ])

  const effectiveProjectDeadline = activeProjectWindow?.submissionDeadline 
    ? new Date(activeProjectWindow.submissionDeadline)
    : DEFAULT_PROJECT_DEADLINE
  projectIdeaDeadline = effectiveProjectDeadline
  const diffMs = effectiveProjectDeadline.getTime() - Date.now()
  projectIdeaDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  canSubmitProjectIdea = diffMs > 0

  // 2. Roles
  if (role === "STUDENT" && studentProfile) {
    const [enrollments, ideaData, notifications] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: studentProfile.id },
        include: {
          subject: {
            include: {
              teacher: { include: { user: true } }
            }
          },
          grades: true
        }
      }),
      prisma.degreeProjectIdea.findUnique({
        where: { studentId: studentProfile.id }
      }),
      prisma.studentNotification.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 6
      })
    ])

    const activeEnrollments = enrollments.map(enr => {
      const teacherName = enr.subject.teacher?.user?.name || "DOCENTE"
      return {
        id: enr.id,
        subject: { 
          id: enr.subject.id, 
          name: enr.subject.name, 
          code: enr.subject.code, 
          credits: enr.subject.credits,
          classroom: "A-201", // Placeholder if classroom isn't in scope
          teacherName: teacherName
        },
        grades: enr.grades || []
      }
    })

    const allRecentGrades: any[] = []
    activeEnrollments.forEach(enr => {
      enr.grades.forEach(g => {
        allRecentGrades.push({
          id: `${enr.id}-${g.cutNumber}`,
          score: g.score,
          cutNumber: g.cutNumber,
          createdAt: new Date(g.createdAt),
          enrollment: { subject: { name: enr.subject.name } }
        })
      })
    })
    studentRecentGrades = allRecentGrades.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)

    studentEnrollments = activeEnrollments
    
    let totalSum = 0;
    let totalSubjectsWithGrades = 0;

    activeEnrollments.forEach(enr => {
      const c1 = enr.grades.find(g => g.cutNumber === 1)?.score || 0;
      const c2 = enr.grades.find(g => g.cutNumber === 2)?.score || 0;
      const c3 = enr.grades.find(g => g.cutNumber === 3)?.score || 0;

      if (c1 > 0 || c2 > 0 || c3 > 0) {
        totalSum += (c1 * 0.3) + (c2 * 0.3) + (c3 * 0.4);
        totalSubjectsWithGrades += 1;
      }
    });

    const promedio = totalSubjectsWithGrades > 0 ? (totalSum / totalSubjectsWithGrades).toFixed(2) : "0.0";

    stats = [
      { title: "Materias Inscritas", value: activeEnrollments.length.toString(), icon: Book, color: "text-utsGreen-800" },
      { title: "Promedio Acumulado", value: promedio, icon: GraduationCap, color: "text-utsGreen-600" },
      { title: "Dias Restantes Idea", value: projectIdeaDaysRemaining.toString(), icon: FileUp, color: "text-blue-500" },
    ]

    if (ideaData) {
      let reviewedByName = null
      if (ideaData.reviewedByUserId) {
        const reviewerUser = await prisma.user.findUnique({ where: { id: ideaData.reviewedByUserId } })
        reviewedByName = reviewerUser?.name || null
      }

      studentProjectIdea = {
        id: ideaData.id,
        title: ideaData.title,
        summary: ideaData.summary,
        documentUrl: ideaData.documentUrl,
        fileName: ideaData.fileName,
        status: ideaData.status,
        teacherFeedback: ideaData.teacherFeedback,
        submittedAt: new Date(ideaData.submittedAt).toISOString(),
        reviewedAt: ideaData.reviewedAt ? new Date(ideaData.reviewedAt).toISOString() : null,
        reviewedByName: reviewedByName,
      }
    }

    studentNotifications = notifications.map(n => ({ 
      ...n, 
      createdAt: new Date(n.createdAt).toISOString() 
    }))

  } else if (role === "TEACHER" && teacherProfile) {
    const [subjects, ideas] = await Promise.all([
      prisma.subject.findMany({
        where: { teacherId: teacherProfile.id }
      }),
      prisma.degreeProjectIdea.findMany({
        orderBy: { submittedAt: 'desc' },
        include: {
          student: { include: { user: true } }
        }
      })
    ])
    
    const subjectIds = subjects.map(s => s.id)
    const enrollments = subjectIds.length > 0 
      ? await prisma.enrollment.findMany({
          where: { subjectId: { in: subjectIds } },
          select: { studentId: true }
        })
      : []

    const uniqueStudentIds = new Set(enrollments.map(e => e.studentId))

    teacherSubjects = subjects
    teacherProjectIdeas = ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      status: idea.status,
      documentUrl: idea.documentUrl,
      fileName: idea.fileName,
      submittedAt: new Date(idea.submittedAt).toISOString(),
      updatedAt: new Date(idea.updatedAt).toISOString(),
      teacherFeedback: idea.teacherFeedback,
      studentName: idea.student.user.name,
      studentCode: idea.student.code || "---",
    }))

    const pendingCount = ideas.filter(i => i.status === "PENDIENTE_REVISION" || i.status === "EN_REVISION").length

    stats = [
      { title: "Mis Materias", value: subjects.length.toString(), icon: Book, color: "text-utsGreen-600" },
      { title: "Mis Estudiantes", value: uniqueStudentIds.size.toString(), icon: Users, color: "text-utsGreen-800" },
      { title: "Ideas por Revisar", value: pendingCount.toString(), icon: FileText, color: "text-blue-500" },
      { title: "Dias Limite", value: projectIdeaDaysRemaining.toString(), icon: FileUp, color: "text-utsGreen-800" },
    ]
  } else if (role === "ADMIN") {
    const [usersCount, subjectsCount] = await Promise.all([
      prisma.user.count(),
      prisma.subject.count()
    ])
    stats = [
      { title: "Usuarios Totales", value: usersCount.toString(), icon: Users, color: "text-oxfordGrey-500" },
      { title: "Materias Activas", value: subjectsCount.toString(), icon: Activity, color: "text-utsGreen-600" },
    ]
  }

  // 3. Noticias y FB Integrations
  const [teacherNews, facebookSettings] = await Promise.all([
    (role === "TEACHER" || role === "ADMIN")
      ? prisma.news.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      : Promise.resolve([]),
    (role === "TEACHER" || role === "ADMIN") ? getFacebookSettingsAction() : Promise.resolve(null)
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-oxfordGrey-900 mb-2 underline decoration-utsGreen-800 decoration-4 underline-offset-8">Hola, {session.user.name?.split(" ")[0] || "Usuario"}</h1>
        <p className="text-oxfordGrey-400">Bienvenido al Portal Académico. Aquí está tu resumen de hoy.</p>
      </div>

      {(role === "TEACHER" || role === "ADMIN") && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <NewsEditor />
            <DocumentUploader />
            {facebookSettings ? (
              <FacebookSettingsCard
                initialPageId={facebookSettings.pageId}
                accessTokenMasked={facebookSettings.accessTokenMasked}
                configured={facebookSettings.configured}
              />
            ) : null}
          </div>
          <Card className="bg-white border-oxfordGrey-200 flex flex-col h-full max-h-[1100px] rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="bg-oxfordGrey-50 border-b border-oxfordGrey-200">
              <CardTitle className="flex items-center gap-2 font-black text-oxfordGrey-900"><FileText className="w-5 h-5 text-utsGreen-800" /> Noticias Publicadas</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4 pt-4">
              {teacherNews.length === 0 ? (
                <p className="text-oxfordGrey-400 text-sm italic">No hay noticias publicadas todavía.</p>
              ) : (
                teacherNews.map((news) => (
                  <div key={news.id} className="p-4 bg-oxfordGrey-50 rounded-xl border border-oxfordGrey-200 flex flex-col gap-2 hover:border-utsGreen-800/30 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-oxfordGrey-900 leading-tight">{news.title}</h3>
                      <DeleteNewsButton id={news.id} />
                    </div>
                    <p className="text-[10px] text-oxfordGrey-400 font-mono">
                      {new Date(news.createdAt).toLocaleDateString("es-CO")}
                    </p>
                    <p className="text-xs text-oxfordGrey-500 line-clamp-2">{news.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bento Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white border-oxfordGrey-200 hover:border-utsGreen-800/50 transition-all hover:shadow-xl rounded-2xl group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-oxfordGrey-400 uppercase tracking-widest">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-oxfordGrey-900 tracking-tighter">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {role === "STUDENT" && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-oxfordGrey-100 shadow-sm">
              <h2 className="text-xl font-black tracking-tighter text-oxfordGrey-900 uppercase">Mis Materias</h2>
              <span className="text-[10px] font-black text-utsGreen-800 bg-utsGreen-50 px-3 py-1 rounded-full border border-utsGreen-200 uppercase">
                {studentEnrollments.length} Asignaturas
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentEnrollments.map((enr) => {
                 const c1 = enr.grades.find((g: any) => g.cutNumber === 1);
                 const c2 = enr.grades.find((g: any) => g.cutNumber === 2);
                 const c3 = enr.grades.find((g: any) => g.cutNumber === 3);

                 return (
                   <Link href={`/dashboard/subject/${enr.subject.id}`} key={enr.id} className="block group">
                     <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-800/50 transition-all duration-300 group-hover:shadow-lg h-full overflow-hidden relative rounded-2xl border-b-4 border-b-utsGreen-800">
                       <CardHeader className="pb-2">
                         <CardTitle className="text-lg text-oxfordGrey-900 font-black group-hover:text-utsGreen-800 transition-colors leading-tight">{enr.subject.name}</CardTitle>
                         <p className="text-[10px] text-oxfordGrey-400 font-bold uppercase tracking-widest">Cód: {enr.subject.code} • {enr.subject.credits} CR</p>
                       </CardHeader>
                       <CardContent>
                         <div className="grid grid-cols-3 gap-2 mt-4 bg-oxfordGrey-50 p-3 rounded-xl border border-oxfordGrey-200">
                           <div className="flex flex-col items-center">
                             <span className="text-oxfordGrey-400 text-[8px] font-black uppercase mb-1">Corte 1</span>
                             <span className={`font-black text-sm ${c1 ? (c1.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>{c1 ? c1.score.toFixed(1) : '-.-'}</span>
                           </div>
                           <div className="flex flex-col items-center border-x border-oxfordGrey-200">
                             <span className="text-oxfordGrey-400 text-[8px] font-black uppercase mb-1">Corte 2</span>
                             <span className={`font-black text-sm ${c2 ? (c2.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>{c2 ? c2.score.toFixed(1) : '-.-'}</span>
                           </div>
                           <div className="flex flex-col items-center">
                             <span className="text-oxfordGrey-400 text-[8px] font-black uppercase mb-1">Corte 3</span>
                             <span className={`font-black text-sm ${c3 ? (c3.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>{c3 ? c3.score.toFixed(1) : '-.-'}</span>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </Link>
                 )
              })}
            </div>

            {projectIdeaDeadline && (
              <DegreeProjectStudentPanel
                deadlineText={projectIdeaDeadline.toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                daysRemaining={projectIdeaDaysRemaining}
                canSubmit={canSubmitProjectIdea}
                idea={studentProjectIdea}
                notifications={studentNotifications}
              />
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-white border-oxfordGrey-200 shadow-xl rounded-3xl overflow-hidden border-t-4 border-t-oxfordGrey-900">
               <CardHeader className="bg-oxfordGrey-50/50 py-5">
                 <CardTitle className="flex items-center gap-2 text-oxfordGrey-900 text-base font-black tracking-tighter uppercase">
                   <Calendar className="w-5 h-5 text-utsGreen-800" />
                   Mi Horario Semanal
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-oxfordGrey-100">
                     {studentEnrollments.length === 0 ? (
                       <div className="p-12 text-center">
                         <p className="text-xs text-oxfordGrey-400 italic">No hay clases registradas.</p>
                       </div>
                     ) : (
                       studentEnrollments.map((enr, idx) => (
                         <div key={idx} className="p-5 hover:bg-utsGreen-50/30 transition-colors group">
                           <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-utsGreen-800 uppercase">LUN - MIE (18:00 - 20:00)</p>
                                <h4 className="text-xs font-bold text-oxfordGrey-900 group-hover:text-utsGreen-950">{enr.subject.name}</h4>
                                <div className="flex flex-col gap-1 pt-2">
                                   <div className="flex items-center gap-1.5 text-[9px] text-oxfordGrey-400 font-bold uppercase">
                                     <Activity className="w-3 h-3 text-utsGreen-600" /> Salón: {enr.subject.classroom || "A-201"}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[9px] text-oxfordGrey-400 font-bold uppercase">
                                     <User className="w-3 h-3 text-utsGreen-600" /> Prof: {enr.subject.teacherName || "DOCENTE"}
                                   </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-oxfordGrey-200 group-hover:text-utsGreen-800 transition-all scale-75" />
                           </div>
                         </div>
                       ))
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-utsGreen-800 text-white rounded-3xl shadow-lg p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
               <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-70">Próximo Evento</h3>
               <p className="text-xl font-bold leading-tight mb-2">Segunda Ceremonia de Grados</p>
               <p className="text-xs text-utsGreen-200">18 - 19 de Junio, 2026</p>
            </Card>
          </div>
        </div>
      )}

      {role === "TEACHER" && (
        <div className="space-y-10">
          <DegreeProjectTeacherPanel ideas={teacherProjectIdeas} />
          <div className="space-y-6 pt-10 border-t border-oxfordGrey-200">
            <h2 className="text-2xl font-black tracking-tighter text-oxfordGrey-900 uppercase">Materias Asignadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherSubjects.map((subject: any) => (
                <Link href={`/dashboard/subject/${subject.id}`} key={subject.id} className="block group">
                  <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-800/50 transition-all duration-300 group-hover:shadow-lg h-full overflow-hidden relative rounded-2xl">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-utsGreen-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-oxfordGrey-900 font-black group-hover:text-utsGreen-800 transition-colors uppercase tracking-tighter">{subject.name}</CardTitle>
                      <p className="text-[10px] text-oxfordGrey-400 font-bold uppercase tracking-widest border-b border-oxfordGrey-50 pb-2">Cód: {subject.code} • {subject.credits} CR</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mt-2 text-sm bg-oxfordGrey-50 p-4 rounded-xl border border-oxfordGrey-200">
                          <span className="text-oxfordGrey-400 text-[10px] font-black uppercase tracking-widest">Gestionar Materia</span>
                          <Book className="w-4 h-4 text-utsGreen-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {role !== "STUDENT" && (
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4 bg-white border-oxfordGrey-200 rounded-2xl shadow-sm">
            <CardHeader><CardTitle className="text-sm font-black text-oxfordGrey-400 uppercase tracking-widest">Estado del Sistema</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-oxfordGrey-500 italic">Operando con normalidad (PostgreSQL).</p></CardContent>
          </Card>
          <Card className="col-span-3 bg-white border-oxfordGrey-200 rounded-2xl shadow-sm">
            <CardHeader><CardTitle className="text-sm font-black text-oxfordGrey-400 uppercase tracking-widest">Eventos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-utsGreen-800" /><p className="text-xs font-bold text-oxfordGrey-700 uppercase">Cierre de Peticiones</p></div>
              <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-utsGreen-300" /><p className="text-xs font-bold text-oxfordGrey-700 uppercase">Inicio Parciales</p></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
