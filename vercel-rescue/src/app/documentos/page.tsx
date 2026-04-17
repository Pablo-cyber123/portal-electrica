import { TransitionLink } from '@/components/transitions/TransitionLink';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ScrollText, GraduationCap, Search } from 'lucide-react';
import Link from 'next/link';

export default function DocumentosHubPage() {
  return (
    <main className="min-h-screen bg-oxfordGrey-50 pb-20 pt-24 font-sans text-oxfordGrey-900">
      
      <nav className="fixed top-0 w-full p-6 border-b border-oxfordGrey-200 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <TransitionLink href="/">
             <Button variant="ghost" className="text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100">
               <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
             </Button>
          </TransitionLink>
          <div className="text-utsGreen-800 font-bold tracking-widest text-sm uppercase hidden sm:block">Repositorio Institucional</div>
        </div>
      </nav>

      <div className="bg-utsGreen-800 border-b border-oxfordGrey-200 mt-[-24px] pt-32 pb-16 px-6 relative overflow-hidden text-white shadow-inner">
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-utsGreen-950/50 text-utsGreen-100 font-bold text-xs uppercase tracking-wider mb-6 border border-utsGreen-500/30">
            <BookOpen className="w-4 h-4" /> Base Documental
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight max-w-4xl">
            Repositorio de <span className="text-utsGreen-300">Documentos</span>
          </h1>
          <p className="text-lg text-utsGreen-50 max-w-2xl font-light">
            Selecciona la categoría que deseas consultar. Encuentra normativas, formatos de grado y toda la base documental de la institución.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Normativa Institucional */}
        <Link href="/documentos/normativa" className="group flex flex-col bg-white border border-oxfordGrey-200 rounded-2xl p-8 hover:border-utsGreen-500 hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-utsGreen-100 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <ScrollText className="w-12 h-12 text-utsGreen-600 mb-6 relative z-10" />
          <h2 className="text-2xl font-bold text-oxfordGrey-900 mb-3 relative z-10 group-hover:text-utsGreen-700 transition-colors">Normativa Institucional</h2>
          <p className="text-oxfordGrey-600 flex-1 relative z-10">
            Consulta reglamentos, resoluciones, manuales y todo el marco normativo de la institución.
          </p>
          <div className="mt-8 flex items-center gap-2 text-utsGreen-600 font-bold text-sm uppercase px-4 py-2 bg-utsGreen-50 rounded-lg group-hover:bg-utsGreen-100 transition-colors self-start">
            Ingresar <ArrowLeft className="w-4 h-4 rotate-180" />
          </div>
        </Link>

        {/* Card 2: Documentos de Grado */}
        <Link href="/documentos/grado" className="group flex flex-col bg-white border border-oxfordGrey-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <GraduationCap className="w-12 h-12 text-blue-600 mb-6 relative z-10" />
          <h2 className="text-2xl font-bold text-oxfordGrey-900 mb-3 relative z-10 group-hover:text-blue-700 transition-colors">Documentos de Grado</h2>
          <p className="text-oxfordGrey-600 flex-1 relative z-10">
            Formatos de prácticas, plantillas de tesis, modalidades de grado y documentos requeridos.
          </p>
          <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm uppercase px-4 py-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors self-start">
            Ingresar <ArrowLeft className="w-4 h-4 rotate-180" />
          </div>
        </Link>

        {/* Card 3: Explorar Documentos */}
        <Link href="/documentos/explorar" className="group flex flex-col bg-white border border-oxfordGrey-200 rounded-2xl p-8 hover:border-oxfordGrey-800 hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-oxfordGrey-100 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <Search className="w-12 h-12 text-oxfordGrey-800 mb-6 relative z-10" />
          <h2 className="text-2xl font-bold text-oxfordGrey-900 mb-3 relative z-10 group-hover:text-oxfordGrey-700 transition-colors">Explorar Documentos</h2>
          <p className="text-oxfordGrey-600 flex-1 relative z-10">
            Búsqueda avanzada y visualización unificada de todo el repositorio documental disponible.
          </p>
          <div className="mt-8 flex items-center gap-2 text-oxfordGrey-800 font-bold text-sm uppercase px-4 py-2 bg-oxfordGrey-100 rounded-lg group-hover:bg-oxfordGrey-200 transition-colors self-start">
            Explorar <ArrowLeft className="w-4 h-4 rotate-180" />
          </div>
        </Link>

      </div>
    </main>
  );
}
