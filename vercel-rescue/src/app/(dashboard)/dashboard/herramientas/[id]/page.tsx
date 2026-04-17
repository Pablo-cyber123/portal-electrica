import { getMatlabProject } from "@/actions/matlab"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { OctaveViewer } from "@/components/matlab/OctaveViewer"
import Link from "next/link"
import { ArrowLeft, Code2 } from "lucide-react"

export default async function HerramientaViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  let project: any
  try {
    project = await getMatlabProject(id)
  } catch {
    notFound()
  }

  return (
    // Full viewport height minus layout padding
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-3">
      
      {/* ── Compact Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-green-50">
            <Code2 className="w-4 h-4 text-green-700" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-gray-900 truncate">{project.title}</h1>
            <p className="text-xs text-gray-400 truncate hidden sm:block">
              {project.description?.substring(0, 90)}...
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/herramientas"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-700 bg-gray-100 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </Link>
      </div>

      {/* ── Full-height Viewer ─────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <OctaveViewer projectId={project.id} title={project.title} />
      </div>
    </div>
  )
}
