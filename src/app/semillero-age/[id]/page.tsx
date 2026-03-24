import { getPublicProjectDetails } from "@/actions/semillero"
import { TransitionLink } from "@/components/transitions/TransitionLink"
import { ArrowLeft, Beaker, Users, Calendar, ArrowRight, Zap, ImageIcon, Video, FileText, Activity } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function PublicProjectDetail({ params }: { params: { id: string } }) {
  const { project, error } = await getPublicProjectDetails(params.id)

  if (error || !project) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 text-center">
        <h1 className="text-3xl font-bold text-oxfordGrey-900 mb-4">Proyecto no encontrado</h1>
        <TransitionLink href="/semillero-age" className="text-utsGreen-800 underline">Volver al semillero</TransitionLink>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oxfordGrey-50 pb-20 pt-24 text-oxfordGrey-900 font-sans">
      
      {/* Header Fijo */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-oxfordGrey-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-utsGreen-600" />
            <span className="font-bold tracking-tight text-utsGreen-800">UTS ELÉCTRICA</span>
          </div>
          <TransitionLink href="/semillero-age" className="text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4"/> Volver
          </TransitionLink>
        </div>
      </nav>

      {/* Hero Detalles */}
      <div className="max-w-4xl mx-auto px-6 mt-8 animate-fade-in-up">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-oxfordGrey-200 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-utsGreen-800/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex gap-2 mb-6 relative z-10">
            <span className="text-xs font-bold text-utsGreen-800 bg-utsGreen-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {project.category}
            </span>
            <span className="text-xs font-bold text-oxfordGrey-600 bg-oxfordGrey-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {project.status}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight text-oxfordGrey-900 relative z-10">
            {project.title}
          </h1>
          
          <p className="text-lg text-oxfordGrey-600 leading-relaxed mb-10 max-w-3xl relative z-10">
            {project.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-oxfordGrey-100 relative z-10">
            <div>
              <span className="block text-xs font-bold text-oxfordGrey-400 uppercase tracking-widest mb-1">Director del Proyecto</span>
              <p className="font-semibold text-oxfordGrey-900">{project.teacher.user.name}</p>
            </div>
            <div>
              <span className="block text-xs font-bold text-oxfordGrey-400 uppercase tracking-widest mb-1">Investigadores</span>
              <p className="font-semibold text-oxfordGrey-900">{project.students.length} Estudiantes Asignados</p>
            </div>
            <div>
              <span className="block text-xs font-bold text-oxfordGrey-400 uppercase tracking-widest mb-2">Progreso Global</span>
              <div className="flex items-center gap-3">
                <div className="w-full bg-oxfordGrey-100 rounded-full h-2">
                  <div className={`h-full rounded-full ${project.progress >= 90 ? 'bg-utsGreen-500' : 'bg-utsGreen-800'}`} style={{ width: `${project.progress}%` }} />
                </div>
                <span className="font-bold text-sm text-utsGreen-800">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de Novedades (Blog/Feed) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <FileText className="w-6 h-6 text-utsGreen-600" /> Novedades y Avances
          </h2>

          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {project.updates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-oxfordGrey-200">
                  <Beaker className="w-10 h-10 text-oxfordGrey-300 mx-auto mb-3" />
                  <p className="text-oxfordGrey-500 font-medium">Aún no hay avances publicados en este proyecto.</p>
                </div>
              ) : (
                project.updates.map((update: any, updateIdx: number) => (
                  <li key={update.id}>
                    <div className="relative pb-12">
                      {updateIdx !== project.updates.length - 1 ? (
                        <span className="absolute left-5 top-12 -ml-px h-full w-0.5 bg-oxfordGrey-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex items-start space-x-4">
                        <div className="relative px-1">
                          <div className="h-8 w-8 rounded-full bg-utsGreen-100 flex items-center justify-center ring-8 ring-oxfordGrey-50">
                            <Activity className="h-4 w-4 text-utsGreen-800" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 bg-white p-6 rounded-2xl border border-oxfordGrey-200 shadow-sm">
                          <div>
                            <div className="text-sm">
                              <span className="font-bold text-oxfordGrey-900">{update.title}</span>
                            </div>
                            <p className="mt-1 text-xs text-oxfordGrey-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(update.createdAt).toLocaleDateString('es-CO')}
                            </p>
                          </div>
                          <div className="mt-4 text-sm text-oxfordGrey-600 whitespace-pre-wrap">
                            <p>{update.content}</p>
                          </div>
                          
                          {/* Adjuntos */}
                          {(update.imageUrl || update.videoUrl || update.documentUrl) && (
                            <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-oxfordGrey-100">
                              {update.imageUrl && (
                                <a href={update.imageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-utsGreen-800 bg-utsGreen-50 px-3 py-2 rounded-lg hover:bg-utsGreen-100 transition-colors">
                                  <ImageIcon className="w-4 h-4" /> Ver Imagen Adjunta
                                </a>
                              )}
                              {update.videoUrl && (
                                <a href={update.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-utsGreen-800 bg-utsGreen-50 px-3 py-2 rounded-lg hover:bg-utsGreen-100 transition-colors">
                                  <Video className="w-4 h-4" /> Ver Video
                                </a>
                              )}
                              {update.documentUrl && (
                                <a href={update.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-utsGreen-800 bg-utsGreen-50 px-3 py-2 rounded-lg hover:bg-utsGreen-100 transition-colors">
                                  <FileText className="w-4 h-4" /> Documentación PDF
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
