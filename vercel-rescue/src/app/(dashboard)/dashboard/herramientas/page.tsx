import { getMatlabProjects } from "@/actions/matlab"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Wrench } from "lucide-react"
import { HerramientasGrid } from "@/components/matlab/HerramientasGrid"

export default async function HerramientasPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const projects = await getMatlabProjects()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-oxfordGrey-900 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-utsGreen-800" /> Herramientas
        </h1>
        <p className="text-sm text-oxfordGrey-500 mt-1">
          Accede a simuladores y herramientas interactivas de Matlab creadas por tus profesores.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="w-12 h-12 text-oxfordGrey-200 mx-auto mb-4" />
          <p className="text-oxfordGrey-400 text-sm">No hay herramientas disponibles aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjeta especial Promocionando la demo interactiva nativa */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Wrench className="w-48 h-48" />
             </div>
             <div className="relative z-10 max-w-xl">
               <h2 className="text-xl font-black mb-2 text-blue-50">✨ Nuevo: Calculadora Interactiva Nativa</h2>
               <p className="text-sm text-blue-200 mb-6 leading-relaxed">
                 Esta es una demostración de una <b>Herramienta Nativa Web</b>. A diferencia de ejecutar código crudo de Matlab, las herramientas nativas te permiten introducir datos (inputs) ajustables en tiempo real y ver gráficas iterativas al instante.
               </p>
               <a href="/dashboard/herramientas/demo-rlc" className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                 Abrir Demostración Interactiva →
               </a>
             </div>
          </div>
          
          <h2 className="font-bold text-lg text-oxfordGrey-800 border-b border-oxfordGrey-200 pb-2 mt-8 mb-4">Scripts Matlab Clásicos</h2>
          <HerramientasGrid projects={projects} />
        </div>
      )}
    </div>
  )
}
