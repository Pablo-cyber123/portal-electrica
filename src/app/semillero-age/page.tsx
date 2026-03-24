import { TransitionLink } from "@/components/transitions/TransitionLink"
import { ArrowLeft, Beaker, Users, Calendar, ArrowRight, Activity, Zap, CheckCircle2 } from "lucide-react"
import { getAllPublicProjects } from "@/actions/semillero"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SemilleroAgePage() {
  const { projects } = await getAllPublicProjects()
  const activeProjects = projects || [];

  return (
    <div className="min-h-screen bg-white text-oxfordGrey-900 pb-20">
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-oxfordGrey-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-utsGreen-600" />
            <span className="font-bold text-xl tracking-tight text-utsGreen-800">UTS ELÉCTRICA</span>
          </div>
          <div className="flex gap-6 items-center">
            <TransitionLink href="/" className="text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium flex items-center gap-2">
              <ArrowLeft className="w-4 h-4"/> Volver al Inicio
            </TransitionLink>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-6 bg-gradient-to-br from-utsGreen-800 to-utsGreen-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-utsGreen-300/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-utsGreen-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-6 backdrop-blur-sm">
              <Beaker className="w-4 h-4 text-utsGreen-300" />
              <span className="text-sm font-medium tracking-wide">Investigación y Desarrollo</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Semillero <span className="text-utsGreen-300">AGE</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed mb-8">
              El semillero de investigación de la Facultad de Ingeniería Electromecánica fomenta la innovación, desarrollo tecnológico y vocación científica en nuestros estudiantes para resolver los retos energéticos del mañana.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-oxfordGrey-900 mb-2">Proyectos de Investigación</h2>
            <p className="text-oxfordGrey-500">Avances y desarrollos actuales de nuestros equipos.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-oxfordGrey-50 text-oxfordGrey-600 rounded-lg text-sm font-medium border border-oxfordGrey-200">
              {activeProjects.length} Proyectos Activos
            </span>
          </div>
        </div>

        {activeProjects.length === 0 ? (
           <div className="text-center py-20 bg-oxfordGrey-50 rounded-2xl border border-oxfordGrey-200">
             <Beaker className="w-12 h-12 text-oxfordGrey-300 mx-auto mb-4" />
             <p className="text-xl font-bold text-oxfordGrey-900">Aún no hay proyectos de investigación activos.</p>
             <p className="text-oxfordGrey-500">Los profesores crearán nuevos proyectos pronto.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProjects.map((project: any) => (
              <div
                key={project.id}
                className="bg-white border border-oxfordGrey-200 hover:border-utsGreen-800/30 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-utsGreen-800 to-utsGreen-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-utsGreen-800 bg-utsGreen-50 px-3 py-1 rounded-full border border-utsGreen-100">
                    {project.category}
                  </span>
                  {project.progress >= 90 ? (
                    <CheckCircle2 className="w-5 h-5 text-utsGreen-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-utsGreen-800 opacity-50" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-oxfordGrey-900 mb-3 group-hover:text-utsGreen-800 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-oxfordGrey-500 text-sm mb-6 flex-1 line-clamp-3">
                  {project.description}
                </p>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-oxfordGrey-600">{project.status}</span>
                    <span className="text-utsGreen-800">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-oxfordGrey-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${project.progress >= 90 ? 'bg-utsGreen-500' : 'bg-utsGreen-800'}`} 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-oxfordGrey-100 flex flex-col gap-3 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-oxfordGrey-500">
                    <Users className="w-4 h-4" />
                    <span>{project.students?.length || 0} Investigadores</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-oxfordGrey-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.createdAt).toLocaleDateString('es-CO')}
                    </div>
                    <Link href={`/semillero-age/${project.id}`} className="text-utsGreen-800 font-bold hover:text-utsGreen-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      Ver más <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
