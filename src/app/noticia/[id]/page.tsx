import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { TransitionLink } from "@/components/transitions/TransitionLink"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({
    where: { id }
  })

  // Validar si existe o la página tira error 404
  if (!article) {
    notFound()
  }

  const formattedDate = article.createdAt.toLocaleDateString("es-CO", { 
    day: "numeric", month: "long", year: "numeric", hour: '2-digit', minute: '2-digit'
  })

  return (
    <main className="min-h-screen bg-white pb-20">
      
      {/* Navbar simplificada para regresar */}
      <nav className="w-full p-6 border-b border-oxfordGrey-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center">
          <TransitionLink href="/#noticias">
             <Button variant="ghost" className="text-oxfordGrey-400 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100">
               <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
             </Button>
          </TransitionLink>
        </div>
      </nav>

      {/* Header Visual */}
      {article.imageUrl && (
        <div className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden">
          <div 
             className="absolute inset-0 bg-cover bg-center"
             style={{ backgroundImage: `url(${article.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>
      )}

      {/* Contenido de la Noticia */}
      <article className={`max-w-3xl mx-auto px-6 relative z-10 ${article.imageUrl ? '-mt-32' : 'mt-16'}`}>
        <header className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <p className="text-utsGreen-800 font-mono tracking-widest text-sm mb-4 uppercase">
            Comunicado Institucional
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-oxfordGrey-900 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex items-center text-oxfordGrey-400 text-sm gap-4 border-l-2 border-utsGreen-800 pl-4">
            <p>Publicado el: <strong className="text-oxfordGrey-900">{formattedDate}</strong></p>
          </div>
        </header>

        {article.videoUrl && (
          <div className="mb-12 rounded-xl overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            {article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') ? (
              <iframe 
                className="w-full aspect-video"
                src={article.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            ) : (
              <video 
                className="w-full aspect-video bg-black" 
                controls 
                src={article.videoUrl} 
                preload="metadata"
              />
            )}
          </div>
        )}

        <div className="prose prose-lg max-w-none text-oxfordGrey-700 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
           <p className="whitespace-pre-line leading-relaxed">
             {article.content}
           </p>
        </div>

        {article.linkUrl && (
          <div className="mt-12 pt-8 border-t border-oxfordGrey-200">
            <a href={article.linkUrl} target="_blank" rel="noopener noreferrer">
               <Button size="lg" className="bg-utsGreen-800 hover:bg-utsGreen-700 text-white font-bold group">
                 Ver Enlace Externo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Button>
            </a>
          </div>
        )}
      </article>

    </main>
  )
}
