"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import Link from 'next/link'
import { TransitionLink } from "@/components/transitions/TransitionLink"
import { ArrowRight, Zap, LogIn, ChevronDown, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { NewsCarousel, NewsItem } from "@/components/news/NewsCarousel"
import { FacebookFeed } from "@/components/news/FacebookFeed"

export default function HomePage({ initialNews }: { initialNews: NewsItem[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <main className="min-h-[200vh] bg-white overflow-hidden relative" ref={targetRef}>
      
      {/* Navbar Institucional */}
      <nav className="fixed top-0 w-full p-6 z-50 bg-white/80 backdrop-blur-md border-b border-oxfordGrey-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-oxfordGrey-900">
          <div className="flex items-center">
            <img src="/logo-electrica.png" alt="Ingeniería Eléctrica UTS" className="h-14 w-auto" />
          </div>

          <button 
            className="lg:hidden p-2 text-oxfordGrey-900 focus:outline-none" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden lg:flex gap-6 items-center">
            <div className="relative group">
              <button className="flex items-center gap-1 text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium py-2">
                Programas <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              {/* Dropdown menú hover */}
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-72">
                <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-oxfordGrey-100 overflow-hidden flex flex-col p-2">
                  <TransitionLink href="/pensum/tecnologia" className="px-4 py-3 hover:bg-utsGreen-50 rounded-lg transition-colors group/link text-left">
                    <span className="block text-sm font-bold text-oxfordGrey-900 group-hover/link:text-utsGreen-800 transition-colors">Tecnología en Sistemas Eléctricos</span>
                    <span className="block text-xs text-oxfordGrey-400 mt-0.5">Nivel Tecnológico (6 Semestres)</span>
                  </TransitionLink>
                  <TransitionLink href="/pensum/ingenieria" className="px-4 py-3 hover:bg-utsGreen-50 rounded-lg transition-colors group/link text-left mt-1">
                    <span className="block text-sm font-bold text-oxfordGrey-900 group-hover/link:text-utsGreen-800 transition-colors">Ingeniería Eléctrica</span>
                    <span className="block text-xs text-oxfordGrey-400 mt-0.5">Nivel Profesional (10 Semestres)</span>
                  </TransitionLink>
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium py-2">
                Base Documental <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              {/* Dropdown menú hover */}
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-72">
                <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-oxfordGrey-100 overflow-hidden flex flex-col p-2">
                  <TransitionLink href="/documentos/explorar" className="px-4 py-3 hover:bg-utsGreen-50 rounded-lg transition-colors group/link text-left">
                    <span className="block text-sm font-bold text-oxfordGrey-900 group-hover/link:text-utsGreen-800 transition-colors">Explorar Documentos</span>
                    <span className="block text-xs text-oxfordGrey-400 mt-0.5">Buscador y repositorio unificado</span>
                  </TransitionLink>
                  <TransitionLink href="/documentos/normativa" className="px-4 py-3 hover:bg-utsGreen-50 rounded-lg transition-colors group/link text-left mt-1">
                    <span className="block text-sm font-bold text-oxfordGrey-900 group-hover/link:text-utsGreen-800 transition-colors">Normativa Institucional</span>
                    <span className="block text-xs text-oxfordGrey-400 mt-0.5">Reglamentos y resoluciones</span>
                  </TransitionLink>
                  <TransitionLink href="/documentos/grado" className="px-4 py-3 hover:bg-utsGreen-50 rounded-lg transition-colors group/link text-left mt-1">
                    <span className="block text-sm font-bold text-oxfordGrey-900 group-hover/link:text-utsGreen-800 transition-colors">Documentos de Grado</span>
                    <span className="block text-xs text-oxfordGrey-400 mt-0.5">Formatos y opciones de grado</span>
                  </TransitionLink>
                </div>
              </div>
            </div>
            
            <TransitionLink href="/noticias" className="text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium">Noticias</TransitionLink>
            <TransitionLink href="/semillero-age" className="text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium">Semillero AGE</TransitionLink>
            <Link href="#facultad" className="text-oxfordGrey-500 hover:text-utsGreen-800 transition-colors font-medium">Facultad</Link>
            <TransitionLink href="/login">
              <Button className="bg-utsGreen-800 text-white hover:bg-utsGreen-700">
                <LogIn className="w-4 h-4 mr-2" /> Ingresar
              </Button>
            </TransitionLink>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-oxfordGrey-200 shadow-lg flex flex-col p-4 gap-4 z-50">
             <div className="flex flex-col gap-2">
                 <span className="font-bold text-oxfordGrey-900 border-b pb-2">Programas</span>
                 <TransitionLink href="/pensum/tecnologia" className="pl-4 text-oxfordGrey-500 py-1">Tecnología en Sistemas Eléctricos</TransitionLink>
                 <TransitionLink href="/pensum/ingenieria" className="pl-4 text-oxfordGrey-500 py-1">Ingeniería Eléctrica</TransitionLink>
             </div>
             <div className="flex flex-col gap-2">
                 <span className="font-bold text-oxfordGrey-900 border-b pb-2">Base Documental</span>
                 <TransitionLink href="/documentos/explorar" className="pl-4 text-oxfordGrey-500 py-1">Explorar Documentos</TransitionLink>
                 <TransitionLink href="/documentos/normativa" className="pl-4 text-oxfordGrey-500 py-1">Normativa Institucional</TransitionLink>
                 <TransitionLink href="/documentos/grado" className="pl-4 text-oxfordGrey-500 py-1">Documentos de Grado</TransitionLink>
             </div>
             <TransitionLink href="/noticias" className="font-bold text-oxfordGrey-900 border-b pb-2">Noticias</TransitionLink>
             <TransitionLink href="/semillero-age" className="font-bold text-oxfordGrey-900 border-b pb-2">Semillero AGE</TransitionLink>
             <TransitionLink href="/login" className="mt-2">
               <Button className="w-full bg-utsGreen-800 text-white hover:bg-utsGreen-700 justify-center">
                 <LogIn className="w-4 h-4 mr-2" /> Ingresar al Portal
               </Button>
             </TransitionLink>
          </div>
        )}
      </nav>

      {/* Hero Section Institucional */}
      <div className="h-screen flex items-center justify-center relative bg-gradient-to-br from-utsGreen-800 via-utsGreen-900 to-utsGreen-950">
        <motion.div 
           className="absolute w-full h-full inset-0 z-0 opacity-30"
           style={{ y, opacity }}
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-utsGreen-300 rounded-full blur-[150px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-utsGreen-400 rounded-full blur-[200px] mix-blend-screen opacity-50" />
        </motion.div>

        <div className="z-10 text-center max-w-4xl px-4 mt-20">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} 
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-tight">
              Ingeniería <br /> <span className="text-utsGreen-300">Sin Límites.</span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
             <p className="text-xl md:text-2xl text-white/70 mb-10 font-light">
              El portal institucional para estudiantes, docentes y líderes del mañana. Gestiona tu academia con tecnología de vanguardia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <TransitionLink href="/login">
                 <Button size="lg" className="rounded-full text-lg px-8 py-6 h-auto group bg-utsGreen-300 hover:bg-utsGreen-400 text-oxfordGrey-900 font-bold border-none">
                   Acceder al Portal <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </TransitionLink>
               <TransitionLink href="/noticias">
                 <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-6 h-auto border-white/30 hover:bg-white/10 text-white">
                   Ver Todas Las Noticias
                 </Button>
               </TransitionLink>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Zona de Noticias — solo visible cuando hay noticias internas */}
      {initialNews.length > 0 && (
        <div id="noticias" className="min-h-screen bg-white py-32 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-6"
            >
              <div>
                 <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-oxfordGrey-900 mb-4">Actualidad <span className="text-utsGreen-800">Eléctrica</span></h2>
                 <p className="text-lg md:text-xl text-oxfordGrey-400 max-w-2xl">Mantente al día con los últimos avisos, cortes de notas y eventos de la facultad.</p>
              </div>
            </motion.div>

            <NewsCarousel news={initialNews} />
          </div>
        </div>
      )}

      {/* Sección Facebook Feed */}
      <div id="facebook" className="bg-oxfordGrey-50 py-24 relative z-20 border-t border-oxfordGrey-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-oxfordGrey-900">Facebook <span className="text-utsGreen-800">Oficial</span></h2>
            </div>
            <p className="text-base md:text-lg text-oxfordGrey-400 max-w-2xl">Últimas publicaciones de la página oficial de Ingeniería Eléctrica UTS en Facebook.</p>
          </motion.div>

          <FacebookFeed />
        </div>
      </div>

    </main>
  )
}
