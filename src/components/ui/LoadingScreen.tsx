"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function LoadingScreen() {
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-[#FAFAFA] flex flex-col items-center justify-center overflow-hidden">
      {/* Luces decorativas de fondo para toque "Premium" */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] bg-utsGreen-300 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative flex flex-col items-center gap-12 z-10 w-full px-6">
        {/* Logo Animado Premium */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
           animate={{ 
             opacity: 1, 
             scale: 1,
             filter: "blur(0px)"
           }}
           transition={{ 
             duration: 1.2,
             ease: [0.16, 1, 0.3, 1]
           }}
           className="relative w-64 md:w-80 lg:w-96 aspect-video flex items-center justify-center"
        >
          {/* El brillo pulsante detrás de la imagen */}
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/40 rounded-3xl blur-2xl -z-10"
          />

          {!imageError ? (
            <img 
              src="/logo-ingenieria.png" 
              alt="Ingeniería Eléctrica UTS"
              className="w-full h-full object-contain drop-shadow-xl"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center text-utsGreen-800">
              <span className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-md">UTS</span>
              <span className="text-[12px] font-bold uppercase tracking-[0.3em] opacity-80 mt-2">Ingeniería Eléctrica</span>
            </div>
          )}
        </motion.div>

        {/* Barra de progreso Ultra Slim */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col items-center gap-4 w-full max-w-xs"
        >
          <div className="w-full h-[3px] bg-oxfordGrey-200/50 rounded-full overflow-hidden relative shadow-inner">
             {/* Progress indicator */}
             <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ 
                 repeat: Infinity, 
                 duration: 1.8, 
                 ease: "easeInOut" 
               }}
               className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-utsGreen-600 to-transparent shadow-[0_0_10px_rgba(34,197,94,0.5)]"
             />
          </div>

          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-utsGreen-800"
          >
            Iniciando Portal
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
