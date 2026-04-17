import { prisma } from '@/lib/prisma';
import { DocumentSearch, OfficialDocument } from '@/components/documents/DocumentSearch';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GradoPage() {
  const documents = await prisma.officialDocument.findMany({
    where: { category: "Documentos de Grado" },
    orderBy: { createdAt: 'desc' }
  });

  const docs = documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    fileUrl: doc.fileUrl,
    createdAt: new Date(doc.createdAt)
  } as OfficialDocument));

  return (
    <main className="min-h-screen bg-oxfordGrey-50 pb-20 pt-24 font-sans text-oxfordGrey-900">
      <nav className="fixed top-0 w-full p-6 border-b border-oxfordGrey-200 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <TransitionLink href="/documentos">
             <Button variant="ghost" className="text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100">
               <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Repositorio
             </Button>
          </TransitionLink>
          <div className="text-blue-800 font-bold tracking-widest text-sm uppercase hidden sm:block">Documentos de Grado</div>
        </div>
      </nav>

      <div className="bg-blue-800 border-b border-oxfordGrey-200 mt-[-24px] pt-32 pb-16 px-6 relative overflow-hidden text-white shadow-inner">
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 text-blue-100 font-bold text-xs uppercase tracking-wider mb-6 border border-blue-500/30">
            <GraduationCap className="w-4 h-4" /> Base Documental
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight max-w-4xl">
            Documentos de <span className="text-blue-300">Grado</span>
          </h1>
          <p className="text-lg text-blue-50 max-w-2xl font-light">
            Formatos y opciones de grado para estudiantes e ingenieros.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <DocumentSearch data={docs} hideCategories={true} />
      </div>
    </main>
  );
}
