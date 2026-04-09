import { auth } from "@/lib/auth"
import { db as adminDb } from "@/lib/firebase-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsEditor } from "@/components/news/NewsEditor"
import { DeleteNewsButton } from "@/components/news/DeleteNewsButton"
import { Activity, Book, GraduationCap, Users, FileText, FileUp } from "lucide-react"
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

  // Obtener datos dependiendo del rol
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

  // 1. Paralelismo Inicial: Datos base comunes y perfil
  const [submissionWindowSnapshot, studentProfileSnapshot, teacherProfileSnapshot] = await Promise.all([
    adminDb.collection("degreeProjectSubmissionWindows")
      .where("isActive", "==", true)
      .orderBy("submissionDeadline", "asc")
      .limit(1)
      .get(),
    role === "STUDENT" ? adminDb.collection("studentProfiles").where("userId", "==", id).limit(1).get() : Promise.resolve(null),
    role === "TEACHER" ? adminDb.collection("teacherProfiles").where("userId", "==", id).limit(1).get() : Promise.resolve(null)
  ])

  const activeProjectWindow = submissionWindowSnapshot && !submissionWindowSnapshot.empty ? submissionWindowSnapshot.docs[0].data() : null
  const studentProfile = studentProfileSnapshot && !studentProfileSnapshot.empty ? { id: studentProfileSnapshot.docs[0].id, ...studentProfileSnapshot.docs[0].data() } : null as any
  const teacherProfile = teacherProfileSnapshot && !teacherProfileSnapshot.empty ? { id: teacherProfileSnapshot.docs[0].id, ...teacherProfileSnapshot.docs[0].data() } : null as any

  const effectiveProjectDeadline = activeProjectWindow?.submissionDeadline 
    ? (activeProjectWindow.submissionDeadline.toDate ? activeProjectWindow.submissionDeadline.toDate() : new Date(activeProjectWindow.submissionDeadline))
    : DEFAULT_PROJECT_DEADLINE
  projectIdeaDeadline = effectiveProjectDeadline
  const diffMs = effectiveProjectDeadline.getTime() - Date.now()
  projectIdeaDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  canSubmitProjectIdea = diffMs > 0

  // 2. Paralelismo Secundario: Datos especificos por rol
  if (role === "STUDENT" && studentProfile) {
    const [enrollmentsSnapshot, ideaSnapshot, notificationsSnapshot] = await Promise.all([
      adminDb.collection("enrollments").where("studentId", "==", studentProfile.id).get(),
      adminDb.collection("degreeProjectIdeas").where("studentId", "==", studentProfile.id).limit(1).get(),
      adminDb.collection("studentNotifications").where("userId", "==", id).orderBy("createdAt", "desc").limit(6).get()
    ])

    const activeEnrollments = await Promise.all(enrollmentsSnapshot.docs.map(async (doc) => {
      const data = doc.data()
      const subjectDoc = await adminDb.collection("subjects").doc(data.subjectId).get()
      const subjectData = subjectDoc.data()
      return {
        id: doc.id,
        subject: { id: subjectDoc.id, name: subjectData?.name, code: subjectData?.code, credits: subjectData?.credits },
        grades: data.grades || []
      }
    }))

    // Recent grades from denormalized enrollments
    const allRecentGrades: any[] = []
    activeEnrollments.forEach(enr => {
      if (enr.grades) {
        enr.grades.forEach((g: any) => {
          allRecentGrades.push({
            id: `${enr.id}-${g.cutNumber}`,
            score: g.score,
            cutNumber: g.cutNumber,
            createdAt: g.createdAt?.toDate ? g.createdAt.toDate() : g.createdAt,
            enrollment: { subject: { name: enr.subject.name } }
          })
        })
      }
    })
    studentRecentGrades = allRecentGrades.sort((a,b) => b.createdAt - a.createdAt).slice(0, 5)

    const ideaData = !ideaSnapshot.empty ? ideaSnapshot.docs[0].data() : null
    const ideaId = !ideaSnapshot.empty ? ideaSnapshot.docs[0].id : null
    const notifications = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    studentEnrollments = activeEnrollments
    
    let totalSum = 0;
    let totalSubjectsWithGrades = 0;

    activeEnrollments.forEach(enr => {
      const c1 = enr.grades.find((g: any) => g.cutNumber === 1)?.score || 0;
      const c2 = enr.grades.find((g: any) => g.cutNumber === 2)?.score || 0;
      const c3 = enr.grades.find((g: any) => g.cutNumber === 3)?.score || 0;

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
        const reviewerDoc = await adminDb.collection("users").doc(ideaData.reviewedByUserId).get()
        reviewedByName = reviewerDoc.data()?.name || null
      }

      studentProjectIdea = {
        id: ideaId!,
        title: ideaData.title,
        summary: ideaData.summary,
        documentUrl: ideaData.documentUrl,
        fileName: ideaData.fileName,
        status: ideaData.status,
        teacherFeedback: ideaData.teacherFeedback,
        submittedAt: (ideaData.submittedAt?.toDate ? ideaData.submittedAt.toDate() : new Date(ideaData.submittedAt)).toISOString(),
        reviewedAt: ideaData.reviewedAt ? (ideaData.reviewedAt.toDate ? ideaData.reviewedAt.toDate().toISOString() : new Date(ideaData.reviewedAt).toISOString()) : null,
        reviewedByName: reviewedByName,
      }
    }

    studentNotifications = notifications.map((n: any) => ({ 
      ...n, 
      createdAt: (n.createdAt?.toDate ? n.createdAt.toDate().toISOString() : new Date(n.createdAt).toISOString()) 
    }))

  } else if (role === "TEACHER" && teacherProfile) {
    const [subjectsSnapshot, ideasSnapshot] = await Promise.all([
      adminDb.collection("subjects").where("teacherId", "==", teacherProfile.id).get(),
      adminDb.collection("degreeProjectIdeas").orderBy("submittedAt", "desc").get()
    ])

    const subjects = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
    const ideas = await Promise.all(ideasSnapshot.docs.map(async (doc) => {
      const data = doc.data()
      const studentProfileId = data?.studentId
      const sProfDoc = studentProfileId ? await adminDb.collection("studentProfiles").doc(studentProfileId).get() : null
      const sProfData = sProfDoc?.data()
      const sUserDoc = sProfData?.userId ? await adminDb.collection("users").doc(sProfData.userId).get() : null
      
      return {
        id: doc.id,
        ...data,
        student: {
          code: sProfData?.code || "---",
          user: { name: sUserDoc?.data()?.name || "Estudiante" }
        }
      } as any
    }))

    teacherSubjects = subjects
    teacherProjectIdeas = ideas.map((idea: any) => ({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      status: idea.status,
      documentUrl: idea.documentUrl,
      fileName: idea.fileName,
      submittedAt: (idea.submittedAt?.toDate ? idea.submittedAt.toDate().toISOString() : new Date(idea.submittedAt).toISOString()),
      updatedAt: (idea.updatedAt?.toDate ? idea.updatedAt.toDate().toISOString() : new Date(idea.updatedAt).toISOString()),
      teacherFeedback: idea.teacherFeedback,
      studentName: idea.student.user.name,
      studentCode: idea.student.code,
    }))

    const pendingCount = ideas.filter(i => i.status === "PENDIENTE_REVISION" || i.status === "EN_REVISION").length

    stats = [
      { title: "Mis Materias", value: subjects.length.toString(), icon: Book, color: "text-utsGreen-600" },
      { title: "Ideas por Revisar", value: pendingCount.toString(), icon: FileText, color: "text-blue-500" },
      { title: "Dias Limite", value: projectIdeaDaysRemaining.toString(), icon: FileUp, color: "text-utsGreen-800" },
    ]
  } else if (role === "ADMIN") {
    const [usersSnapshot, subjectsSnapshot] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("subjects").get()
    ])
    stats = [
      { title: "Usuarios Totales", value: usersSnapshot.size.toString(), icon: Users, color: "text-oxfordGrey-500" },
      { title: "Materias Activas", value: subjectsSnapshot.size.toString(), icon: Activity, color: "text-utsGreen-600" },
    ]
  }

  // 3. Paralelismo Final: Noticias y Configuración
  const [teacherNews, facebookSettings] = await Promise.all([
    (role === "TEACHER" || role === "ADMIN")
      ? adminDb.collection("newsArticles")
          .where("published", "==", true)
          .orderBy("createdAt", "desc")
          .limit(10)
          .get()
          .then(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)))
      : Promise.resolve([]),
    (role === "TEACHER" || role === "ADMIN") ? getFacebookSettingsAction() : Promise.resolve(null)
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-oxfordGrey-900 mb-2">Hola, {session.user.name?.split(" ")[0] || "Usuario"}</h1>
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
           <Card className="bg-white border-oxfordGrey-200 flex flex-col h-full max-h-[1100px]">
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-utsGreen-800" /> Noticias Publicadas</CardTitle>
             </CardHeader>
             <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
               {teacherNews.length === 0 ? (
                 <p className="text-oxfordGrey-400 text-sm">No hay noticias publicadas todavia.</p>
               ) : (
                 teacherNews.map((news: any) => (
                   <div key={news.id} className="p-4 bg-oxfordGrey-50 rounded-lg border border-oxfordGrey-200 flex flex-col gap-2">
                     <div className="flex justify-between items-start gap-4">
                       <h3 className="font-bold text-oxfordGrey-900 leading-tight">{news.title}</h3>
                       <DeleteNewsButton id={news.id} />
                     </div>
                     <p className="text-xs text-oxfordGrey-400 font-mono">
                       {(news.createdAt?.toDate ? news.createdAt.toDate().toLocaleDateString("es-CO") : new Date(news.createdAt).toLocaleDateString("es-CO"))}
                     </p>
                     <p className="text-sm text-oxfordGrey-400 line-clamp-2">{news.content}</p>
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
          <Card key={i} className="bg-white border-oxfordGrey-200 hover:border-oxfordGrey-300 transition-colors hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-oxfordGrey-400">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-oxfordGrey-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {role === "STUDENT" && projectIdeaDeadline && (
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

      {role === "TEACHER" && (
        <DegreeProjectTeacherPanel ideas={teacherProjectIdeas} />
      )}

      {role === "STUDENT" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-oxfordGrey-900 mb-4">Mis Materias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentEnrollments.map((enr) => {
               const c1 = enr.grades.find((g: any) => g.cutNumber === 1);
               const c2 = enr.grades.find((g: any) => g.cutNumber === 2);
               const c3 = enr.grades.find((g: any) => g.cutNumber === 3);

               return (
                 <Link href={`/dashboard/subject/${enr.subject.id}`} key={enr.id} className="block group">
                   <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-800/50 transition-all duration-300 group-hover:shadow-lg h-full overflow-hidden relative">
                     <div className="absolute top-0 left-0 w-1 h-full bg-utsGreen-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <CardHeader className="pb-2">
                       <CardTitle className="text-lg text-oxfordGrey-900 font-bold group-hover:text-utsGreen-800 transition-colors">{enr.subject.name}</CardTitle>
                       <p className="text-xs text-oxfordGrey-400 font-mono">Cód: {enr.subject.code} • {enr.subject.credits} Créditos</p>
                     </CardHeader>
                     <CardContent>
                       <div className="flex justify-between mt-4 text-sm bg-oxfordGrey-50 p-3 rounded-lg border border-oxfordGrey-200">
                         <div className="flex flex-col items-center">
                           <span className="text-oxfordGrey-400 text-xs mb-1">Corte 1</span>
                           <span className={`font-black text-lg ${c1 ? (c1.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>{c1 ? c1.score.toFixed(1) : '-.-'}</span>
                         </div>
                         <div className="w-px bg-oxfordGrey-200 self-stretch" />
                         <div className="flex flex-col items-center">
                           <span className="text-oxfordGrey-400 text-xs mb-1">Corte 2</span>
                           <span className={`font-black text-lg ${c2 ? (c2.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>{c2 ? c2.score.toFixed(1) : '-.-'}</span>
                         </div>
                         <div className="w-px bg-oxfordGrey-200 self-stretch" />
                         <div className="flex flex-col items-center">
                           <span className="text-oxfordGrey-400 text-xs mb-1">Corte 3</span>
                           <span className={`font-black text-lg ${c3 ? (c3.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>{c3 ? c3.score.toFixed(1) : '-.-'}</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </Link>
               )
            })}
          </div>
        </div>
      )}

      {role === "TEACHER" && (
        <div className="space-y-4 pt-10 border-t border-oxfordGrey-200">
          <h2 className="text-xl font-bold tracking-tight text-oxfordGrey-900 mb-4">Materias Asignadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherSubjects.map((subject: any) => (
               <Link href={`/dashboard/subject/${subject.id}`} key={subject.id} className="block group">
                 <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-800/50 transition-all duration-300 group-hover:shadow-lg h-full overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-utsGreen-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <CardHeader className="pb-4">
                     <CardTitle className="text-lg text-oxfordGrey-900 font-bold group-hover:text-utsGreen-800 transition-colors">{subject.name}</CardTitle>
                     <p className="text-xs text-oxfordGrey-400 font-mono">Cód: {subject.code} • {subject.credits} Créditos</p>
                   </CardHeader>
                   <CardContent>
                     <div className="flex justify-between items-center mt-2 text-sm bg-oxfordGrey-50 p-3 rounded-lg border border-oxfordGrey-200">
                        <span className="text-oxfordGrey-400 text-xs">Ir al Muro de la Materia</span>
                        <Book className="w-4 h-4 text-utsGreen-600 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </CardContent>
                 </Card>
               </Link>
            ))}
            {teacherSubjects.length === 0 && (
              <p className="text-sm text-oxfordGrey-400">No tienes materias asignadas actualmente.</p>
            )}
          </div>
        </div>
      )}

      {/* Zona de Actividad Reciente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white border-oxfordGrey-200 h-full">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {role === "STUDENT" ? (
              studentRecentGrades.length > 0 ? (
                <div className="space-y-3">
                  {studentRecentGrades.map((grade: any) => (
                    <div key={grade.id} className="flex justify-between items-center bg-oxfordGrey-50 p-3 rounded-lg border border-oxfordGrey-200 hover:border-oxfordGrey-300 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-utsGreen-300/20 flex items-center justify-center border border-utsGreen-300/30">
                            <GraduationCap className="w-5 h-5 text-utsGreen-600" />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-oxfordGrey-900 leading-tight">{grade.enrollment.subject.name}</p>
                           <p className="text-xs text-oxfordGrey-400 mt-0.5">Calificación publicada • Corte {grade.cutNumber}</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-black text-xl ${grade.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500'}`}>
                           {grade.score.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-oxfordGrey-400">{new Date(grade.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <Activity className="w-8 h-8 text-oxfordGrey-300 mb-2" />
                  <p className="text-sm text-oxfordGrey-400">No hay calificaciones nuevas en este periodo.</p>
                </div>
              )
            ) : (
              <p className="text-sm text-oxfordGrey-400">El sistema está operando con normalidad.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-utsGreen-800" />
                  <p className="text-sm font-medium text-oxfordGrey-700">Cierre de Peticiones</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-utsGreen-300" />
                  <p className="text-sm font-medium text-oxfordGrey-700">Inicio Parciales Corte 2</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
