"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Zap } from "lucide-react"

type AuthShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
  bottomPrompt: string
  bottomCta: string
  bottomHref: string
}

import { TransitionLink } from "@/components/transitions/TransitionLink"
import { Button } from "@/components/ui/button"

export function AuthShell({
  title,
  subtitle,
  children,
  bottomPrompt,
  bottomCta,
  bottomHref
}: AuthShellProps) {
  const pathname = usePathname()
  const direction = useMemo(() => (pathname === "/registro" ? 60 : -60), [pathname])

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="fixed top-0 left-0 w-full p-4 sm:p-6 border-b border-oxfordGrey-200 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <TransitionLink href="/">
             <Button variant="ghost" className="text-oxfordGrey-400 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 flex items-center px-1 sm:px-4">
               <ArrowLeft className="w-4 h-4 sm:mr-2" />
               <span className="hidden sm:inline">Volver al Inicio</span>
               <span className="sm:hidden ml-1">Volver</span>
             </Button>
          </TransitionLink>
          <div className="text-utsGreen-800 font-bold tracking-wider sm:tracking-widest text-xs sm:text-sm uppercase text-right leading-tight">Portal Académico</div>
        </div>
      </nav>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1fr_360px]">
          <motion.section
            key={pathname}
            initial={{ opacity: 0, y: 18, x: direction }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex items-center justify-center lg:justify-start"
          >
            <div className="w-full max-w-2xl rounded-3xl sm:rounded-[2.5rem] border border-oxfordGrey-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <div className="grid lg:grid-cols-[100px_1fr]">
                <div className="hidden rounded-l-[2.5rem] bg-[#c8cf21] lg:block" />
                <div className="p-4 sm:p-12 overflow-hidden w-full">
                  <div className="mb-10 text-center lg:text-left">
                    <div className="mb-8 flex flex-col lg:flex-row items-center gap-6">
                      <img src="/logo-uts-oficial.png" alt="UTS Oficial" className="h-20 w-auto object-contain mix-blend-multiply" />
                      <div className="leading-tight text-center lg:text-left border-l-2 border-transparent lg:border-oxfordGrey-100 lg:pl-6">
                        <p className="text-sm font-bold text-oxfordGrey-500 uppercase tracking-widest">Ingeniería Eléctrica</p>
                        <p className="text-xl font-black tracking-tighter text-utsGreen-600 uppercase">Portal Académico</p>
                      </div>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-oxfordGrey-900 sm:text-5xl">{title}</h1>
                    {subtitle ? (
                      <p className="mt-4 text-base text-oxfordGrey-500 max-w-md mx-auto lg:mx-0 leading-relaxed">{subtitle}</p>
                    ) : null}
                  </div>

                  {children}

                  <div className="mt-8 pt-8 border-t border-oxfordGrey-50 text-center lg:text-left text-sm font-medium text-oxfordGrey-500">
                    {bottomPrompt}{" "}
                    <TransitionLink href={bottomHref} className="font-bold text-utsGreen-800 underline underline-offset-4 hover:text-utsGreen-600 transition-colors">
                      {bottomCta}
                    </TransitionLink>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
            className="hidden lg:block overflow-hidden rounded-[2.5rem] border border-utsGreen-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] h-[600px] relative"
          >
            <img src="/banner-login.png" alt="Excelencia Académica UTS" className="absolute inset-0 w-full h-full object-cover" />
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
