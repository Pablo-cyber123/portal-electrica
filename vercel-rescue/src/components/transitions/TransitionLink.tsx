"use client"

import { useRouter } from "next/navigation"
import { ReactNode, MouseEvent } from "react"

interface TransitionLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
  onClick?: () => void;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function TransitionLink({ children, href, className, onClick }: TransitionLinkProps) {
  const router = useRouter()

  const handleTransition = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Si el usuario presiona CTRL/CMD, dejar que el navegador abra la nueva pestaña normalmente
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
       window.open(href, '_blank')
       return
    }

    if (onClick) {
      onClick()
    }

    const sidebarToggle = document.getElementById("mobile-sidebar-toggle") as HTMLInputElement;
    if (sidebarToggle) {
        sidebarToggle.checked = false;
    }

    const body = document.body;
    
    // Contenedor principal que se eleva por encima de todo
    const overlay = document.createElement("div")
    overlay.className = "fixed inset-0 z-[10000] flex flex-col items-center justify-center pointer-events-none overflow-hidden bg-[#FAFAFA]"
    overlay.style.opacity = "0"
    overlay.style.transition = "opacity 0.4s ease-out"

    // Aura decorativa
    const aura = document.createElement("div")
    aura.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] bg-utsGreen-300 rounded-full blur-[120px] pointer-events-none"
    aura.style.opacity = "0.15"

    // Logo Wrapper
    const logoWrapper = document.createElement("div")
    logoWrapper.className = "relative w-48 sm:w-64 md:w-80 lg:w-96 aspect-video flex items-center justify-center"
    logoWrapper.style.transform = "scale(0.95)"
    logoWrapper.style.filter = "blur(10px)"
    logoWrapper.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
    
    const logoImg = document.createElement("img")
    logoImg.src = "/logo-ingenieria.png"
    logoImg.className = "w-full h-full object-contain drop-shadow-xl"

    logoWrapper.appendChild(logoImg)

    // Barra de progreso y texto de carga
    const progressContainer = document.createElement("div")
    progressContainer.className = "flex flex-col items-center gap-4 w-full max-w-xs mt-12"
    progressContainer.style.opacity = "0"
    progressContainer.style.transform = "translateY(10px)"
    progressContainer.style.transition = "all 0.5s ease"

    const track = document.createElement("div")
    track.className = "w-full h-[3px] bg-oxfordGrey-200/50 rounded-full overflow-hidden relative shadow-inner"

    const progress = document.createElement("div")
    progress.className = "absolute top-0 bottom-0 left-0 w-[70%] bg-gradient-to-r from-transparent via-utsGreen-600 to-transparent shadow-[0_0_10px_rgba(34,197,94,0.5)]"
    progress.style.transition = "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)"

    const loadingText = document.createElement("p")
    loadingText.className = "text-[11px] font-bold uppercase tracking-[0.25em] text-utsGreen-800"
    loadingText.innerText = "CARGANDO MÓDULO"

    track.appendChild(progress)
    progressContainer.appendChild(track)
    progressContainer.appendChild(loadingText)

    overlay.appendChild(aura)
    overlay.appendChild(logoWrapper)
    overlay.appendChild(progressContainer)
    body.appendChild(overlay)

    // Forzar redibujado
    void overlay.offsetHeight

    // Fase 1: Entrada
    overlay.style.opacity = "1"
    
    setTimeout(() => {
      logoWrapper.style.transform = "scale(1)"
      logoWrapper.style.filter = "blur(0px)"
      progressContainer.style.opacity = "1"
      progressContainer.style.transform = "translateY(0px)"
    }, 50)

    // Simular progreso de carga antes de cambiar la ruta
    setTimeout(() => {
      progress.style.width = "90%"
    }, 200)

    // Esperar a que la pantalla quede clara firmemente y enseñar el logo
    await sleep(650)

    // Fase 2: Route push (La navegación por debajo)
    router.push(href)

    // Esperar a que Next.js resuelva el chunk de la página nueva
    progress.style.width = "100%"
    await sleep(650)

    // Fase 3: Exit Animation (Desaparecer overlay)
    overlay.style.opacity = "0"
    logoWrapper.style.transform = "scale(0.95)"
    logoWrapper.style.filter = "blur(10px)"

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
