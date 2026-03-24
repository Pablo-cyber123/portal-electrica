import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPublicProjectDetails, assignStudentByEmail, createProjectTask, setTaskStatus, createProjectUpdate } from "@/actions/semillero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, CheckCircle, Clock, CheckSquare, Plus, FileText, ImageIcon, VideoIcon } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function ManageProjectPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect("/login")
  
  const role = session.user.role
  const { project, error } = await getPublicProjectDetails(params.id)

  if (error || !project) {
    return <div className="p-8 text-center text-red-500 font-bold">Proyecto no encontrado o ocurrió un error.</div>
  }

  // Server actions wrapper
  async function handleAssignStudent(formData: FormData) {
    "use server"
    const email = formData.get("email") as string
    if (email) await assignStudentByEmail(project!.id, email)
  }

  async function handleCreateTask(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    if (title) await createProjectTask(project!.id, title)
  }

  async function handleCreateUpdate(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const imageUrl = formData.get("imageUrl") as string
    if (title && content) {
      await createProjectUpdate(project!.id, { title, content, imageUrl })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <Link href="/dashboard/semillero-age" className="inline-flex items-center text-sm font-medium text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver a mis proyectos
      </Link>

      <div className="bg-white rounded-2xl border border-oxfordGrey-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-oxfordGrey-100 pb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-utsGreen-800 bg-utsGreen-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-oxfordGrey-100 text-oxfordGrey-600">
                {project.status}
              </span>
            </div>
            <h1 className="text-3xl font-black text-oxfordGrey-900 mb-4">{project.title}</h1>
            <p className="text-oxfordGrey-600">{project.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-oxfordGrey-500">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/> {project.students.length} Investigadores</span>
            </div>
          </div>
          
          <div className="md:w-64 bg-oxfordGrey-50 rounded-xl p-6 border border-oxfordGrey-200 text-center flex flex-col justify-center">
            <span className="text-sm font-bold text-oxfordGrey-500 mb-2 uppercase tracking-wider">Progreso Global</span>
            <div className="text-5xl font-black text-utsGreen-800 mb-4">{project.progress}%</div>
            <div className="w-full bg-oxfordGrey-200 rounded-full h-2">
              <div className={`h-full rounded-full transition-all duration-1000 ${project.progress >= 90 ? 'bg-utsGreen-500' : 'bg-utsGreen-800'}`} style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area: Tareas y Novedades */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tareas */}
            <Card className="border-oxfordGrey-200 shadow-sm">
              <CardHeader className="bg-oxfordGrey-50 border-b border-oxfordGrey-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-utsGreen-600" /> Tareas de Ejecución
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <form action={handleCreateTask} className="flex gap-3 mb-6">
                  <input name="title" required placeholder="Agregar nueva tarea al plan..." className="flex-1 rounded-md border border-oxfordGrey-300 px-3 py-2 text-sm focus:ring-2 focus:ring-utsGreen-800 outline-none" />
                  <Button type="submit" variant="outline" className="text-utsGreen-800 border-utsGreen-200 hover:bg-utsGreen-50">
                    <Plus className="w-4 h-4 mr-1" /> Añadir
                  </Button>
                </form>
                
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-oxfordGrey-500 text-center py-4">No hay tareas creadas.</p>
                ) : (
                  <div className="space-y-3">
                    {project.tasks.map((task: any) => (
                      <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${task.status === 'COMPLETADA' ? 'bg-utsGreen-50/50 border-utsGreen-200' : 'bg-white border-oxfordGrey-200'}`}>
                        <div className="flex items-center gap-3">
                          {task.status === 'COMPLETADA' ? <CheckCircle className="w-5 h-5 text-utsGreen-500" /> : <Clock className="w-5 h-5 text-oxfordGrey-400" />}
                          <span className={`text-sm font-medium ${task.status === 'COMPLETADA' ? 'line-through text-oxfordGrey-400' : 'text-oxfordGrey-800'}`}>{task.title}</span>
                        </div>
                        {task.status !== 'COMPLETADA' && (
                          <form action={async () => {
                            "use server"
                            await setTaskStatus(task.id, project.id, "COMPLETADA")
                          }}>
                            <Button type="submit" size="sm" variant="ghost" className="text-xs text-utsGreen-700 hover:text-utsGreen-800 hover:bg-utsGreen-100 h-8">Finalizar</Button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publicar Novedad */}
            <Card className="border-oxfordGrey-200 shadow-sm">
              <CardHeader className="bg-oxfordGrey-50 border-b border-oxfordGrey-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-utsGreen-800" /> Publicar Novedad Documentada
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form action={handleCreateUpdate} className="space-y-4">
                  <input name="title" required placeholder="Título del avance..." className="w-full rounded-md border border-oxfordGrey-300 px-3 py-2 text-sm focus:ring-2 focus:ring-utsGreen-800 outline-none" />
                  <textarea name="content" required placeholder="Detalla el resultado de la tarea, la documentación o los problemas encontrados..." rows={4} className="w-full rounded-md border border-oxfordGrey-300 px-3 py-2 text-sm focus:ring-2 focus:ring-utsGreen-800 outline-none resize-none" />
                  <div className="flex gap-4">
                    <div className="flex-1 flex relative items-center">
                      <ImageIcon className="w-4 h-4 text-oxfordGrey-400 absolute left-3" />
                      <input name="imageUrl" placeholder="Enlace a imagen (opcional)" className="w-full rounded-md border border-oxfordGrey-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-utsGreen-800 outline-none" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-utsGreen-800 hover:bg-utsGreen-700 text-white">Publicar Avance</Button>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Area: Estudiantes Asignados y Profesores */}
          <div className="space-y-8">
            
            {role === "TEACHER" && (
              <Card className="border-oxfordGrey-200 shadow-sm border-2 border-utsGreen-100">
                <CardHeader className="bg-white border-b border-oxfordGrey-100 pb-4">
                  <CardTitle className="text-md text-utsGreen-800">Vincular Investigador</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <form action={handleAssignStudent} className="flex flex-col gap-3">
                    <input name="email" type="email" required placeholder="Correo del estudiante..." className="rounded-md border border-oxfordGrey-300 px-3 py-2 text-sm" />
                    <Button type="submit" variant="secondary" className="w-full bg-utsGreen-50 text-utsGreen-800 hover:bg-utsGreen-100 font-bold">Asignar Estudiante</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="border-oxfordGrey-200 shadow-sm">
              <CardHeader className="bg-oxfordGrey-50 border-b border-oxfordGrey-100 py-4">
                <CardTitle className="text-md text-oxfordGrey-900">Equipo de Investigación</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-xs font-bold text-oxfordGrey-400 uppercase tracking-widest mb-2 block">Director</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-utsGreen-800 flex items-center justify-center text-white font-bold text-xs">
                      {project.teacher.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{project.teacher.user.name}</p>
                      <p className="text-xs text-oxfordGrey-500">{project.teacher.user.email}</p>
                    </div>
                  </div>
                </div>
                
                {project.students.length > 0 && (
                  <div className="pt-4 border-t border-oxfordGrey-100">
                    <span className="text-xs font-bold text-oxfordGrey-400 uppercase tracking-widest mb-3 block">Estudiantes Auxiliares</span>
                    <div className="space-y-3">
                      {project.students.map((assignment: any) => (
                        <div key={assignment.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-utsGreen-600 flex items-center justify-center text-white font-bold text-xs">
                            {assignment.student.user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{assignment.student.user.name}</p>
                            <p className="text-xs text-oxfordGrey-500 truncate">{assignment.student.code}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
