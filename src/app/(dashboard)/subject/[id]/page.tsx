import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, GraduationCap, User, Megaphone, Calendar, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnnouncementEditor } from "@/components/subject/AnnouncementEditor"
import { DeleteAnnouncementButton } from "@/components/subject/DeleteAnnouncementButton"

export const dynamic = "force-dynamic"

export default async function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subject = (await prisma.subject.findUnique({
    where: { id },
    include: {
      teacher: { include: { user: true } },
      announcements: { orderBy: { createdAt: "desc" } }
    }
  })) as any

  if (!subject) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let studentGrades: any[] = []

  if (session.user.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) notFound()
    
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_subjectId: { studentId: profile.id, subjectId: id } },
      include: { grades: true }
    })
    
    if (!enrollment) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
           <h1 className="text-2xl font-bold text-oxfordGrey-900">Acceso Denegado</h1>
           <p className="text-oxfordGrey-400">No estás inscrito en esta materia.</p>
           <Link href="/dashboard"><Button variant="outline">Volver al Dashboard</Button></Link>
         </div>
      )
    }

    studentGrades = enrollment.grades
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Navigation */}
      <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-oxfordGrey-400 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 p-0 h-auto gap-2 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver a mis materias</span>
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-utsGreen-800 to-utsGreen-950 border border-utsGreen-700/50 rounded-2xl p-8 relative overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-utsGreen-300/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-utsGreen-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-mono text-white/80 shadow-sm">
                  {subject.code}
                </span>
                <span className="px-3 py-1 bg-utsGreen-300/20 border border-utsGreen-300/30 rounded-full text-xs font-mono text-utsGreen-300 shadow-sm flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {subject.credits} Créditos
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {subject.name}
              </h1>
              <div className="flex items-center gap-2 text-white/60 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10">
                <User className="w-4 h-4 text-utsGreen-300" />
                <span className="text-sm">Profesor: <strong className="text-white font-medium">{subject.teacher.user.name}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Grades (Only for students) */}
        <div className="lg:col-span-1 space-y-6">
          {session.user.role === "STUDENT" && (
            <Card className="bg-white border-oxfordGrey-200 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <CardHeader className="border-b border-oxfordGrey-200 bg-oxfordGrey-50">
                <CardTitle className="flex items-center gap-2 text-lg text-oxfordGrey-900">
                  <GraduationCap className="w-5 h-5 text-utsGreen-600" /> Mis Calificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-oxfordGrey-200">
                  {[1, 2, 3].map(cut => {
                    const grade = studentGrades.find(g => g.cutNumber === cut);
                    return (
                      <div key={cut} className="p-5 flex justify-between items-center hover:bg-oxfordGrey-50 transition-colors">
                        <div>
                          <p className="font-bold text-oxfordGrey-900">Corte {cut}</p>
                          <p className="text-xs text-oxfordGrey-400 mt-1 font-mono">Valor: {cut === 3 ? '40%' : '30%'}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-3xl font-black tracking-tighter ${grade ? (grade.score >= 3.0 ? 'text-utsGreen-600' : 'text-red-500') : 'text-oxfordGrey-300'}`}>
                            {grade ? grade.score.toFixed(1) : '-.-'}
                          </span>
                          {grade?.observation && (
                            <span className="text-[10px] text-oxfordGrey-400 mt-1 truncate max-w-[100px] border border-oxfordGrey-200 px-2 py-0.5 rounded bg-oxfordGrey-50" title={grade.observation}>
                              {grade.observation}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-oxfordGrey-200 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <CardHeader className="bg-oxfordGrey-50">
              <CardTitle className="flex items-center gap-2 text-lg text-oxfordGrey-900">
                <Activity className="w-5 h-5 text-utsGreen-800" /> Estado de Materia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between items-center p-3 bg-oxfordGrey-50 rounded-lg border border-oxfordGrey-200">
                <span className="text-oxfordGrey-400 text-sm">Estado Académico</span>
                <span className="px-3 py-1 bg-utsGreen-300/20 text-utsGreen-700 border border-utsGreen-300/30 rounded-full text-xs font-bold w-fit">EN CURSO</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-oxfordGrey-50 rounded-lg border border-oxfordGrey-200">
                <span className="text-oxfordGrey-400 text-sm">Departamento</span>
                <span className="text-oxfordGrey-900 text-sm font-medium text-right">{subject.teacher.department}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Announcements */}
        <div className={session.user.role === "STUDENT" ? "lg:col-span-2 space-y-6 animate-fade-in-up" : "lg:col-span-3 space-y-6 animate-fade-in-up"} style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          
          <h2 className="text-2xl font-bold text-oxfordGrey-900 flex items-center gap-3 mb-6 bg-oxfordGrey-50 p-4 rounded-xl border border-oxfordGrey-200">
            <Megaphone className="w-6 h-6 text-utsGreen-800" /> 
            Muro de la Materia
            <span className="ml-auto text-xs font-normal text-oxfordGrey-400 bg-white px-3 py-1 rounded-full border border-oxfordGrey-200">
              {subject.announcements.length} Publicaciones
            </span>
          </h2>

          {/* Teacher Action: Create Announcement */}
          {session.user.role === "TEACHER" && session.user.id === subject.teacher.userId && (
            <AnnouncementEditor subjectId={subject.id} />
          )}
          
          {subject.announcements.length === 0 ? (
            <div className="bg-oxfordGrey-50 border-dashed border-2 border-oxfordGrey-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center transition-all hover:bg-white">
              <div className="w-20 h-20 bg-oxfordGrey-100 rounded-full flex items-center justify-center mb-6">
                <Megaphone className="w-8 h-8 text-oxfordGrey-300" />
              </div>
              <h3 className="text-2xl font-bold text-oxfordGrey-900 mb-3">No hay publicaciones activas</h3>
              <p className="text-oxfordGrey-400 max-w-md mx-auto text-sm leading-relaxed">
                El profesor no ha compartido avisos o material para esta materia todavía. Las publicaciones aparecerán aquí ordenadas cronológicamente.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {subject.announcements.map((announcement: any) => (
                <Card key={announcement.id} className="bg-white border-oxfordGrey-200 hover:border-oxfordGrey-300 transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-utsGreen-800 opacity-50 transition-opacity group-hover:opacity-100" />
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                       <h3 className="text-xl sm:text-2xl font-bold text-oxfordGrey-900 leading-tight">{announcement.title}</h3>
                       <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 text-xs text-oxfordGrey-400 font-mono whitespace-nowrap bg-oxfordGrey-50 px-4 py-2 rounded-full border border-oxfordGrey-200">
                           <Calendar className="w-3.5 h-3.5" />
                           {new Date(announcement.createdAt).toLocaleDateString("es-CO", { day: 'numeric', month: 'short', year: 'numeric' })}
                         </div>
                         {session.user.role === "TEACHER" && session.user.id === subject.teacher.userId && (
                           <DeleteAnnouncementButton id={announcement.id} subjectId={subject.id} />
                         )}
                       </div>
                    </div>
                    <div className="prose max-w-none text-oxfordGrey-600">
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                        {announcement.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
