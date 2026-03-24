import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTeacherProjects, getStudentProjects, createProject } from "@/actions/semillero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Beaker, Plus, Activity, Users, ArrowRight } from "lucide-react"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function DashboardSemilleroPage() {
  const session = await auth()
  if (!session) redirect("/login")
  
  const role = session.user.role

  let projectsData: any = { projects: [] }

  if (role === "TEACHER") {
    projectsData = await getTeacherProjects()
  } else if (role === "STUDENT") {
    projectsData = await getStudentProjects()
  }

  // Server Action inline para crear un proyecto rápido (Profesor)
  async function handleCreateProject(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    
    if (title && description && category) {
      await createProject({ title, description, category })
      revalidatePath("/dashboard/semillero-age")
    }
  }

  const projects = projectsData.projects || []

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-oxfordGrey-900 mb-2">Semillero AGE</h1>
          <p className="text-oxfordGrey-500">
            {role === "TEACHER" 
              ? "Gestiona tus proyectos de investigación y supervisa el avance de los estudiantes." 
              : "Tus proyectos de investigación asignados. Actualiza tu progreso y sube novedades."}
          </p>
        </div>
      </div>

      {role === "TEACHER" && (
        <Card className="bg-white border-oxfordGrey-200 shadow-sm mb-8">
          <CardHeader className="border-b border-oxfordGrey-100 bg-oxfordGrey-50">
            <CardTitle className="flex items-center gap-2 text-lg text-utsGreen-800">
              <Plus className="w-5 h-5" /> Crear Nuevo Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={handleCreateProject} className="flex flex-col md:flex-row gap-4">
              <input 
                name="title" 
                placeholder="Título del Proyecto" 
                required 
                className="flex-1 rounded-md border border-oxfordGrey-300 bg-white px-3 py-2 text-sm placeholder:text-oxfordGrey-400 focus:outline-none focus:ring-2 focus:ring-utsGreen-800"
              />
              <input 
                name="category" 
                placeholder="Categoría (ej. Energías Renovables)" 
                required 
                className="flex-1 rounded-md border border-oxfordGrey-300 bg-white px-3 py-2 text-sm placeholder:text-oxfordGrey-400 focus:outline-none focus:ring-2 focus:ring-utsGreen-800"
              />
              <input 
                name="description" 
                placeholder="Breve descripción" 
                required 
                className="flex-2 rounded-md border border-oxfordGrey-300 bg-white px-3 py-2 text-sm placeholder:text-oxfordGrey-400 focus:outline-none focus:ring-2 focus:ring-utsGreen-800 w-full md:w-auto"
              />
              <Button type="submit" className="bg-utsGreen-800 hover:bg-utsGreen-700 text-white">
                Crear Proyecto
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <div className="bg-oxfordGrey-50 border-2 border-dashed border-oxfordGrey-200 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Beaker className="w-8 h-8 text-oxfordGrey-400" />
          </div>
          <h3 className="text-xl font-bold text-oxfordGrey-900 mb-2">No hay proyectos activos</h3>
          <p className="text-oxfordGrey-500 max-w-md mx-auto">
            {role === "TEACHER" 
              ? "Crea tu primer proyecto de investigación arriba para poder empezar a asignar estudiantes."
              : "No se te ha asignado ningún proyecto de investigación aún. Habla con tu profesor tutor."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => {
            const numStudents = role === "TEACHER" ? project.students?.length || 0 : undefined;
            
            return (
              <Card key={project.id} className="bg-white border-oxfordGrey-200 hover:border-utsGreen-800/50 transition-colors group flex flex-col h-full">
                <CardHeader className="border-b border-oxfordGrey-100 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-utsGreen-800 bg-utsGreen-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      {project.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${project.status === "COMPLETADO" ? "bg-utsGreen-100 text-utsGreen-700" : "bg-oxfordGrey-100 text-oxfordGrey-600"}`}>
                      {project.status}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-oxfordGrey-900 line-clamp-2 leading-tight">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col">
                  <p className="text-sm text-oxfordGrey-500 mb-6 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-oxfordGrey-500">Avance Total</span>
                        <span className="text-utsGreen-800">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-oxfordGrey-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${project.progress >= 90 ? 'bg-utsGreen-500' : 'bg-utsGreen-800'}`} 
                          style={{ width: `${project.progress}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-oxfordGrey-100">
                      {role === "TEACHER" && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-oxfordGrey-500">
                          <Users className="w-3.5 h-3.5" /> {numStudents} asignados
                        </div>
                      )}
                      
                      <Link href={`/dashboard/semillero-age/${project.id}`} className="ml-auto">
                        <Button variant="outline" size="sm" className="border-oxfordGrey-200 text-utsGreen-800 hover:bg-utsGreen-50 text-xs py-1 h-auto font-bold group-hover:border-utsGreen-800">
                          Gestionar <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
