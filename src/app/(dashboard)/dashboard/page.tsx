import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewsEditor } from "@/components/news/NewsEditor"
import { DeleteNewsButton } from "@/components/news/DeleteNewsButton"
import { Activity, Book, GraduationCap, Users, FileText, FileUp } from "lucide-react"
import { DocumentUploader } from "@/components/documents/DocumentUploader"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardHome() {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let studentEnrollments: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let studentRecentGrades: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let teacherSubjects: any[] = []

  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: id } })
    if (profile) {
      const activeEnrollments = await prisma.enrollment.findMany({
        where: { studentId: profile.id },
        include: { subject: true, grades: true }
      })
      studentEnrollments = activeEnrollments
      
      let totalSum = 0;
      let totalSubjectsWithGrades = 0;

      activeEnrollments.forEach(enrollment => {
        const c1 = enrollment.grades.find(g => g.cutNumber === 1)?.score || 0;
        const c2 = enrollment.grades.find(g => g.cutNumber === 2)?.score || 0;
        const c3 = enrollment.grades.find(g => g.cutNumber === 3)?.score || 0;

        if (c1 > 0 || c2 > 0 || c3 > 0) {
          const subjectFinal = (c1 * 0.3) + (c2 * 0.3) + (c3 * 0.4);
          totalSum += subjectFinal;
          totalSubjectsWithGrades += 1;
        }
      });

      const promedio = totalSubjectsWithGrades > 0 ? (totalSum / totalSubjectsWithGrades).toFixed(2) : "0.0";

      stats = [
        { title: "Materias Inscritas", value: activeEnrollments.length.toString(), icon: Book, color: "text-utsGreen-800" },
        { title: "Promedio Acumulado", value: promedio.toString(), icon: GraduationCap, color: "text-utsGreen-600" },
      ]

      studentRecentGrades = await prisma.grade.findMany({
        where: { enrollment: { studentId: profile.id } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { enrollment: { include: { subject: true } } }
      })
    }
  } else if (role === "TEACHER") {
    const profile = await prisma.teacherProfile.findUnique({ 
      where: { userId: id },
      include: { subjects: true } 
    })
    
    if (profile) {
      teacherSubjects = profile.subjects
      stats = [
        { title: "Mis Materias", value: profile.subjects.length.toString(), icon: Book, color: "text-utsGreen-600" },
        { title: "Publicaciones", value: "0", icon: FileText, color: "text-blue-500" },
      ]
    }
  } else if (role === "ADMIN") {
    const users = await prisma.user.count()
    const subjects = await prisma.subject.count()
    stats = [
      { title: "Usuarios Totales", value: users.toString(), icon: Users, color: "text-oxfordGrey-500" },
      { title: "Materias Activas", value: subjects.toString(), icon: Activity, color: "text-utsGreen-600" },
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let teacherNews: any[] = []
  if (role === "TEACHER" || role === "ADMIN") {
    teacherNews = await prisma.newsArticle.findMany({
      where: role === "TEACHER" ? { authorId: id } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-oxfordGrey-900 mb-2">Hola, {session.user.name?.split(" ")[0] || "Usuario"}</h1>
        <p className="text-oxfordGrey-400">Bienvenido al Portal Académico. Aquí está tu resumen de hoy.</p>
      </div>

      {/* Editor de Noticias visible para TEACHER o ADMIN */}
      {(role === "TEACHER" || role === "ADMIN") && (
         <div className="grid lg:grid-cols-2 gap-8">
           <div className="flex flex-col gap-8">
             <NewsEditor />
             <DocumentUploader />
           </div>
           <Card className="bg-white border-oxfordGrey-200 flex flex-col h-full max-h-[1100px]">
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-utsGreen-800" /> Mis Noticias Publicadas</CardTitle>
             </CardHeader>
             <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
               {teacherNews.length === 0 ? (
                 <p className="text-oxfordGrey-400 text-sm">No has publicado noticias todavía.</p>
               ) : (
                 teacherNews.map((news) => (
                   <div key={news.id} className="p-4 bg-oxfordGrey-50 rounded-lg border border-oxfordGrey-200 flex flex-col gap-2">
                     <div className="flex justify-between items-start gap-4">
                       <h3 className="font-bold text-oxfordGrey-900 leading-tight">{news.title}</h3>
                       <DeleteNewsButton id={news.id} />
                     </div>
                     <p className="text-xs text-utsGreen-800 font-mono">
                       {news.createdAt.toLocaleDateString("es-CO")}
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

      {/* Student Mis Materias y Calificaciones */}
      {role === "STUDENT" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-oxfordGrey-900 mb-4">Mis Materias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentEnrollments.map((enr) => {
               const c1 = enr.grades.find((g: { cutNumber: number, score: number }) => g.cutNumber === 1);
               const c2 = enr.grades.find((g: { cutNumber: number, score: number }) => g.cutNumber === 2);
               const c3 = enr.grades.find((g: { cutNumber: number, score: number }) => g.cutNumber === 3);

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

      {/* Teacher Mis Materias */}
      {role === "TEACHER" && (
        <div className="space-y-4 pt-10 border-t border-oxfordGrey-200">
          <h2 className="text-xl font-bold tracking-tight text-oxfordGrey-900 mb-4">Materias Asignadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherSubjects.map((subject) => (
               <Link href={`/dashboard/subject/${subject.id}`} key={subject.id} className="block group">
                 <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-800/50 transition-all duration-300 group-hover:shadow-lg h-full overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-utsGreen-300 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  {studentRecentGrades.map((grade) => (
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
