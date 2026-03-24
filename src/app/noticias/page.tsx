import { getAllPublicNews } from "@/actions/news"
import { NewsCarousel } from "@/components/news/NewsCarousel"
import { TransitionLink } from "@/components/transitions/TransitionLink"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function NoticiasPage() {
  const allNews = await getAllPublicNews()

  return (
    <main className="min-h-screen bg-white pb-20 pt-24 font-sans">
      
      {/* Navbar simplificada para regresar */}
      <nav className="fixed top-0 w-full p-6 border-b border-oxfordGrey-200 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <TransitionLink href="/">
             <Button variant="ghost" className="text-oxfordGrey-400 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100">
               <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
             </Button>
          </TransitionLink>
          <div className="text-utsGreen-800 font-bold tracking-widest text-sm uppercase">Portal de Noticias</div>
        </div>
      </nav>

      {/* Hero Header para la Página de Noticias */}
      <div className="max-w-7xl mx-auto px-6 mb-16 mt-12">
        <h1 className="text-5xl md:text-6xl font-black text-oxfordGrey-900 tracking-tighter mb-4">
          Todas las <span className="text-utsGreen-800">Noticias</span>
        </h1>
        <p className="text-xl text-oxfordGrey-400 max-w-2xl">
          Explora el historial completo de comunicados, eventos y novedades de la Escuela de Ingeniería Eléctrica.
        </p>
      </div>

      {/* Grid General */}
      <div className="max-w-7xl mx-auto px-6">
        <NewsCarousel news={allNews} />
      </div>

    </main>
  )
}
