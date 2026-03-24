"use client"

import { useRouter } from "next/navigation"
import { ReactNode, MouseEvent } from "react"

interface TransitionLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function TransitionLink({ children, href, className }: TransitionLinkProps) {
  const router = useRouter()

  const handleTransition = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Si el usuario presiona CTRL/CMD, dejar que el navegador abra la nueva pestaña normalmente
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
       window.open(href, '_blank')
       return
    }

    const body = document.body;
    
    // Contenedor principal que se eleva por encima de todo
    const overlay = document.createElement("div")
    overlay.className = "fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden"
    
    // Capa de ruido (Noise) para el look premium
    const noise = document.createElement("div")
    noise.className = "noise"
    noise.style.opacity = "0"
    noise.style.transition = "opacity 0.5s ease"

    // Primera capa: verde de fondo
    const bg1 = document.createElement("div")
    bg1.className = "absolute inset-0 bg-utsGreen-500"
    bg1.style.transform = "translateY(100%)"
    bg1.style.transition = "transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)"
    
    // Segunda capa: gris oxford
    const bg2 = document.createElement("div")
    bg2.className = "absolute inset-0 bg-oxfordGrey-950" // Un poco más oscuro
    bg2.style.transform = "translateY(100%)"
    bg2.style.transition = "transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)"

    // Logo interactivo UTS cargando
    const logoWrapper = document.createElement("div")
    logoWrapper.className = "relative z-10 text-white font-black text-5xl md:text-7xl tracking-tighter"
    logoWrapper.style.opacity = "0"
    logoWrapper.style.transform = "translateY(40px) scale(0.9)"
    logoWrapper.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
    logoWrapper.innerHTML = 'UTS<span class="text-utsGreen-400">ELÉCTRICA</span>'

    // Barra de progreso
    const progress = document.createElement("div")
    progress.className = "absolute bottom-0 left-0 h-1 bg-utsGreen-400 z-[10001]"
    progress.style.width = "0%"
    progress.style.transition = "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)"

    overlay.appendChild(bg1)
    overlay.appendChild(bg2)
    overlay.appendChild(noise)
    overlay.appendChild(logoWrapper)
    overlay.appendChild(progress)
    body.appendChild(overlay)

    // Forzar redibujado
    void overlay.offsetHeight

    // Fase 1: Entrada
    bg1.style.transform = "translateY(0%)"
    
    setTimeout(() => {
      bg2.style.transform = "translateY(0%)"
      noise.style.opacity = "0.05"
      progress.style.width = "70%" // Llenar hasta el 70% mientras carga
    }, 100)

    setTimeout(() => {
      logoWrapper.style.opacity = "1"
      logoWrapper.style.transform = "translateY(0) scale(1)"
    }, 500)

    // Esperar a que la pantalla quede negra firmemente y enseñar el logo
    await sleep(950)

    // Fase 2: Route push (La navegación por debajo)
    router.push(href)

    // Esperar a que Next.js resuelva el chunk de la página nueva
    progress.style.width = "100%"
    await sleep(650)

    // Fase 3: Exit Animation (Levantar de la pantalla hacia arriba revelando nueva vista)
    logoWrapper.style.opacity = "0"
    logoWrapper.style.transform = "translateY(-30px)"
    
    setTimeout(() => {
      bg1.style.transform = "translateY(-100%)"
    }, 150)

    setTimeout(() => {
      bg2.style.transform = "translateY(-100%)"
    }, 250)

    // Cleanup del DOM para evitar sobrecargas de memoria
    await sleep(1100)
    if (overlay.parentNode === body) {
      body.removeChild(overlay)
    }
  }

  return (
    <a onClick={handleTransition} href={href} className={className} style={{ cursor: "pointer" }}>
      {children}
    </a>
  )
}
