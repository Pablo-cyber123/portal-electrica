import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, User, Megaphone, Users, Mail, CreditCard, ChevronRight, Share2, Copy, Send, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnnouncementEditor } from "@/components/subject/AnnouncementEditor"
import { SubjectQR } from "@/components/subject/SubjectQR"
import { StudentGradeList } from "@/components/subject/StudentGradeList"

export const dynamic = "force-dynamic"

export default async function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) redirect("/login")

    const resolvedParams = await params
    const id = resolvedParams?.id
    if (!id) return notFound()
    
    // 1. Obtención de Materia (Fallback por código)
    let subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { id: id },
          { code: id }
        ]
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        announcements: {
          orderBy: { createdAt: 'desc' }
        },
        enrollments: {
          include: {
            student: {
              include: { user: true }
            },
            grades: true
          }
        }
      }
    })

    if (!subject) return notFound()

    const subjectIdActual = subject.id

    // 2. Docente de la materia
    const teacherUser = subject.teacher?.user || { name: "Docente no asignado", email: "N/A" }
    
    // 3. Verificación de Rol
    const isTeacher = session.user.role === "TEACHER" && (session.user.id === subject.teacher?.userId || session.user.email === teacherUser.email)

    // 4. Fetch Anuncios
    const announcements = subject.announcements

    // 5. Fetch Estudiantes Matriculados
    const enrolledStudents = subject.enrollments.map(enr => {
      const sProf = enr.student
      const sName = sProf?.user?.name || "Estudiante"
      const sEmail = sProf?.user?.email || "N/A"
      const sCC = sProf?.code || "N/A"
      
      return {
        id: enr.id,
        name: sName,
        email: sEmail,
        cc: sCC,
        grades: enr.grades || []
      }
    })

    const viewSubject = {
      id: subjectIdActual,
      code: subject.code || "N/A",
      name: subject.name || "Asignatura",
      credits: subject.credits || 0,
      classroom: "A-201",
      teacher: { ...subject.teacher, user: teacherUser },
      announcements,
      enrolledStudents
    }

    const invitationUrl = `https://portal-electrica.vercel.app/dashboard/enroll/${viewSubject.id}`

    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-10 px-4">
        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-oxfordGrey-400 hover:text-oxfordGrey-900 gap-2 font-black uppercase text-[10px] tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Volver al portal
            </Button>
          </Link>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-utsGreen-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-utsGreen-800">Sincronizado</span>
          </div>
        </div>

        {/* Header Master */}
        <div className="bg-gradient-to-br from-utsGreen-800 to-utsGreen-950 border border-utsGreen-700/50 rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="relative z-10 space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-md">
                {viewSubject.code}
              </span>
              <span className="px-4 py-1.5 bg-utsGreen-400/20 border border-utsGreen-400/30 rounded-full text-[10px] font-black text-utsGreen-300 uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                < BookOpen className="w-4 h-4" /> {viewSubject.credits} Créditos
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none max-w-4xl">
              {viewSubject.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-4">
               <div className="flex items-center gap-4 bg-white/5 pr-8 pl-2 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
                 <div className="w-12 h-12 rounded-full bg-utsGreen-400/20 flex items-center justify-center border border-utsGreen-400/30">
                   <User className="w-6 h-6 text-utsGreen-300" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[8px] uppercase font-black text-utsGreen-300/60 tracking-widest">Docente</span>
                   <span className="text-base font-bold text-white leading-tight">{teacherUser.name}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Panel de Control Estudiantes (Solo Docente) */}
        {isTeacher && (
           <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-12 space-y-10">
                 <Card className="bg-white border-oxfordGrey-100 rounded-[40px] shadow-2xl overflow-hidden">
                    <CardHeader className="bg-oxfordGrey-50 py-8 px-10 border-b border-oxfordGrey-100 flex flex-row items-center justify-between">
                       <div className="space-y-1">
                          <CardTitle className="text-2xl font-black text-oxfordGrey-900 tracking-tighter uppercase flex items-center gap-3">
                            <Users className="w-8 h-8 text-utsGreen-800" /> Control Académico
                          </CardTitle>
                          <p className="text-xs text-oxfordGrey-400 font-bold">Gestión de calificaciones y autoinscripción del curso.</p>
                       </div>
                    </CardHeader>
                    <CardContent className="p-10">
                       <div className="space-y-12">
                          <div className="grid md:grid-cols-2 gap-10">
                             <SubjectQR subjectId={viewSubject.id} subjectName={viewSubject.name} />
                             
                             <div className="bg-oxfordGrey-50 p-10 rounded-[40px] border border-oxfordGrey-100 flex flex-col justify-center space-y-8">
                                <div>
                                   <h4 className="text-[10px] font-black uppercase text-oxfordGrey-400 tracking-widest mb-4">Invitación por Enlace</h4>
                                   <div className="bg-white p-5 rounded-2xl border border-oxfordGrey-200 font-mono text-xs text-oxfordGrey-500 break-all leading-relaxed shadow-inner">
                                     {invitationUrl}
                                   </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <Button className="bg-utsGreen-800 hover:bg-utsGreen-950 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-xl shadow-utsGreen-800/10">
                                    <Send className="w-4 h-4 mr-2" /> Compartir
                                  </Button>
                                  <Button variant="outline" className="border-oxfordGrey-200 text-oxfordGrey-900 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl">
                                    <Mail className="w-4 h-4 mr-2" /> Correo
                                  </Button>
                                </div>
                             </div>
                          </div>

                          {/* Listado Interactivo de Estudiantes */}
                          <StudentGradeList students={enrolledStudents} subjectId={viewSubject.id} />
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </div>
        )}

        {/* Muro de Anuncios */}
        <div className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-10">
              <section className="space-y-8">
                <div className="flex items-center justify-between px-6">
                   <h2 className="text-2xl font-black text-oxfordGrey-900 flex items-center gap-4 uppercase tracking-tighter leading-none">
                      <Megaphone className="w-8 h-8 text-utsGreen-800" /> Muro de la Facultad
                   </h2>
                </div>

                {isTeacher && <AnnouncementEditor subjectId={viewSubject.id} />}

                <div className="space-y-6">
                   {announcements.map((ann) => (
                     <Card key={ann.id} className="bg-white border-oxfordGrey-100 shadow-xl rounded-[32px] overflow-hidden group hover:border-utsGreen-300 transition-all duration-300">
                       <CardContent className="p-10 space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-utsGreen-500" />
                               <h3 className="font-black text-oxfordGrey-900 uppercase tracking-tighter text-lg">{ann.title}</h3>
                             </div>
                             <span className="text-[10px] font-black text-oxfordGrey-400 uppercase tracking-widest bg-oxfordGrey-50 px-3 py-1 rounded-full">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-base text-oxfordGrey-600 leading-relaxed font-medium">{ann.content}</p>
                       </CardContent>
                     </Card>
                   ))}
                </div>
              </section>
           </div>

           <aside className="lg:col-span-4 space-y-10">
              <Card className="bg-oxfordGrey-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                 <h4 className="text-[10px] font-black uppercase text-utsGreen-300 tracking-widest mb-6">Próximos Pasos</h4>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                          <ChevronRight className="w-5 h-5 text-utsGreen-300" />
                       </div>
                       <p className="text-xs text-white/80 leading-relaxed">Sincronice sus calificaciones antes del cierre de corte oficial.</p>
                    </div>
                 </div>
              </Card>
           </aside>
        </div>
      </div>
    )

  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT') || err.digest?.startsWith('NEXT_NOT_FOUND')) throw err
    
    console.error("SUBJECT PAGE FINAL RECONSTRUCTION CRASH:", err)
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-red-50">
        <Card className="max-w-md w-full p-12 text-center shadow-2xl rounded-[40px] border-none">
           <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-8" />
           <h2 className="font-black text-2xl mb-4 text-oxfordGrey-900 uppercase tracking-tighter">Fallo de Carga Directa</h2>
           <p className="text-sm text-oxfordGrey-400 mb-10 italic leading-relaxed">
             Estamos experimentando problemas técnicos al cargar los módulos interactivos.
           </p>
           <Link href="/dashboard" className="block w-full">
             <Button className="bg-utsGreen-800 hover:bg-utsGreen-950 text-white w-full h-14 rounded-2xl font-black uppercase text-xs">Regresar al Portal</Button>
           </Link>
        </Card>
      </div>
    )
  }
}
