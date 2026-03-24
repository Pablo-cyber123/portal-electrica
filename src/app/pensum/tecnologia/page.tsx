import { TransitionLink } from "@/components/transitions/TransitionLink"
import { ArrowLeft, BookOpen, GraduationCap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const MOCK_PENSUM_TECNOLOGIA = [
  {
    semester: "Semestre I",
    credits: 16,
    subjects: ["Cálculo Diferencial", "Álgebra Lineal", "Introducción a la Electricidad", "Expresión Oral", "Electiva Profesional I"]
  },
  {
    semester: "Semestre II",
    credits: 15,
    subjects: ["Cálculo Integral", "Física Mecánica", "Circuitos DC", "Programación Básica", "Deporte y Cultura"]
  },
  {
    semester: "Semestre III",
    credits: 17,
    subjects: ["Ecuaciones Diferenciales", "Física Electromagnética", "Circuitos AC", "Electrónica Básica", "Electiva II"]
  },
  {
    semester: "Semestre IV",
    credits: 16,
    subjects: ["Medidas Eléctricas", "Instalaciones Eléctricas Industriales", "Máquinas Estáticas", "Control Analógico"]
  },
  {
    semester: "Semestre V",
    credits: 18,
    subjects: ["Máquinas Rotativas", "Sistemas Digitales", "Subestaciones", "Electrónica de Potencia", "Seguridad Industrial"]
  },
  {
    semester: "Semestre VI",
    credits: 16,
    subjects: ["Protecciones Eléctricas", "Diseño de Redes", "Formulación de Proyecto de Grado", "Ética Tecnológica", "Práctica Empresarial"]
  }
];

export default function PensumTecnologia() {
  return (
    <main className="min-h-screen bg-oxfordGrey-50 pb-20 pt-24 font-sans text-oxfordGrey-900">
      
      {/* Navbar simplificada para regresar */}
      <nav className="fixed top-0 w-full p-6 border-b border-oxfordGrey-200 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <TransitionLink href="/">
             <Button variant="ghost" className="text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100">
               <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
             </Button>
          </TransitionLink>
          <div className="text-utsGreen-800 font-bold tracking-widest text-sm uppercase hidden sm:block">Plan de Estudios</div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-white border-b border-oxfordGrey-200 mt-[-24px] pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-utsGreen-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-utsGreen-50 text-utsGreen-800 font-bold text-xs uppercase tracking-wider mb-6 border border-utsGreen-200">
            <GraduationCap className="w-4 h-4" /> Nivel Tecnológico
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-oxfordGrey-900 tracking-tighter mb-6 leading-tight max-w-4xl">
            Tecnología en <span className="text-utsGreen-800">Sistemas Eléctricos</span>
          </h1>
          <div className="flex flex-wrap gap-6 text-oxfordGrey-500 text-sm font-medium">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-utsGreen-500" /> Duración: 6 Semestres</div>
            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-utsGreen-500" /> Modalidad: Presencial</div>
          </div>
        </div>
      </div>

      {/* Pensum Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PENSUM_TECNOLOGIA.map((sem, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-oxfordGrey-200 hover:shadow-lg transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-utsGreen-400 to-utsGreen-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-utsGreen-800 uppercase tracking-tight">{sem.semester}</h3>
                <span className="text-xs font-medium text-oxfordGrey-400 bg-oxfordGrey-100 px-3 py-1 rounded-full">
                  {sem.credits} Créditos
                </span>
              </div>
              
              <ul className="space-y-3">
                {sem.subjects.map((subj, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3 text-sm text-oxfordGrey-700">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-utsGreen-500 shrink-0" />
                    <span>{subj}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
