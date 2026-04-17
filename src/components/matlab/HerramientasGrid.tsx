"use client"

import { TransitionLink } from "@/components/transitions/TransitionLink"
import { FileCode2, ArrowRight, Cpu } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  functionality: string
  fileName: string
  createdAt: Date
}

export function HerramientasGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p, i) => (
        <div
          key={p.id}
          className="group relative bg-white rounded-2xl border border-oxfordGrey-100 overflow-hidden hover:shadow-xl hover:shadow-utsGreen-800/5 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Gradient accent header */}
          <div className="h-2 bg-gradient-to-r from-utsGreen-800 via-utsGreen-600 to-emerald-400" />

          <div className="p-5 space-y-3">
            {/* Icon + Title */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-utsGreen-800/10 to-emerald-400/10 group-hover:from-utsGreen-800/20 group-hover:to-emerald-400/20 transition-colors">
                <Cpu className="w-5 h-5 text-utsGreen-800" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-oxfordGrey-900 text-sm leading-tight">{p.title}</h3>
                <p className="text-xs text-oxfordGrey-400 mt-0.5">{p.fileName}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-oxfordGrey-600 leading-relaxed line-clamp-2">{p.description}</p>

            {/* Functionality */}
            <div className="bg-oxfordGrey-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-oxfordGrey-700 mb-1">¿Qué realiza?</p>
              <p className="text-xs text-oxfordGrey-500 leading-relaxed line-clamp-3">{p.functionality}</p>
            </div>

            {/* Action button */}
            <TransitionLink
              href={`/dashboard/herramientas/${p.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-utsGreen-800 hover:bg-utsGreen-900 text-white text-sm font-bold rounded-xl transition-all duration-200 group-hover:shadow-lg group-hover:shadow-utsGreen-800/20"
            >
              <FileCode2 className="w-4 h-4" />
              Acceder
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </TransitionLink>
          </div>
        </div>
      ))}
    </div>
  )
}
