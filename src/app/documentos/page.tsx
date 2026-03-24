import prisma from '@/lib/db';
import { DocumentSearch } from '@/components/documents/DocumentSearch';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DocumentosPage() {
  const docs = await prisma.officialDocument.findMany({
    orderBy: { createdAt: 'desc' },
  });

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
            Encuentra y consulta todo tipo de formatos, plantillas, normativas y resoluciones actualizadas.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <DocumentSearch data={docs} />
      </div>

    </main>
  );
}
