"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ClipboardList, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateDegreeProjectIdeaStatusAction } from "@/actions/degree-project"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type TeacherIdea = {
  id: string
  title: string
  summary: string
  status: string
  documentUrl: string
  fileName: string | null
  submittedAt: string
  updatedAt: string
  teacherFeedback: string | null
  studentName: string
  studentCode: string
}

const STATUS_OPTIONS = [
  { value: "PENDIENTE_REVISION", label: "Pendiente de revision" },
  { value: "EN_REVISION", label: "En revision" },
  { value: "APROBADA", label: "Aprobada" },
  { value: "REQUIERE_AJUSTES", label: "Requiere ajustes" },
  { value: "RECHAZADA", label: "Rechazada" }
]

type Props = {
  ideas: TeacherIdea[]
}

export function DegreeProjectTeacherPanel({ ideas }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedbackByIdea, setFeedbackByIdea] = useState<Record<string, string>>(
    Object.fromEntries(ideas.map((idea) => [idea.id, idea.teacherFeedback ?? ""]))
  )
  const [statusByIdea, setStatusByIdea] = useState<Record<string, string>>(
    Object.fromEntries(ideas.map((idea) => [idea.id, idea.status]))
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSave = (ideaId: string) => {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("ideaId", ideaId)
        formData.append("status", statusByIdea[ideaId] || "PENDIENTE_REVISION")
        formData.append("feedback", feedbackByIdea[ideaId] || "")
        await updateDegreeProjectIdeaStatusAction(formData)
        setMessage("Estado actualizado y notificacion enviada al estudiante.")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "No fue posible actualizar el estado.")
      }
    })
  }

  return (
    <Card className="border-oxfordGrey-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-utsGreen-800" />
          Ideas de proyecto de grado
        </CardTitle>
        <p className="text-sm text-oxfordGrey-500">
          Todos los profesores pueden revisar las ideas enviadas por los alumnos.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        {ideas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-oxfordGrey-200 p-6 text-sm text-oxfordGrey-500">
            Aun no hay ideas registradas por estudiantes.
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="rounded-xl border border-oxfordGrey-200 bg-oxfordGrey-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-utsGreen-800">
                    {idea.studentName} · Codigo {idea.studentCode}
                  </p>
                  <h3 className="text-lg font-bold text-oxfordGrey-900">{idea.title}</h3>
                  <p className="text-sm text-oxfordGrey-600">{idea.summary}</p>
                </div>
                <Link href={idea.documentUrl} target="_blank" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full gap-2 border-utsGreen-200 text-utsGreen-800 hover:bg-utsGreen-50 transition-colors shadow-sm">
                    <FileText className="h-4 w-4" />
                    {idea.fileName || "Ver Propuesta PDF"}
                  </Button>
                </Link>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px,1fr,150px]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-oxfordGrey-700">Estado</label>
                  <select
                    value={statusByIdea[idea.id] || idea.status}
                    onChange={(event) =>
                      setStatusByIdea((current) => ({
                        ...current,
                        [idea.id]: event.target.value
                      }))
                    }
                    className="h-10 w-full rounded-md border border-oxfordGrey-200 bg-white px-3 text-sm text-oxfordGrey-900 focus:outline-none focus:ring-2 focus:ring-utsGreen-800"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-oxfordGrey-700">Observacion</label>
                  <Textarea
                    value={feedbackByIdea[idea.id] || ""}
                    onChange={(event) =>
                      setFeedbackByIdea((current) => ({
                        ...current,
                        [idea.id]: event.target.value
                      }))
                    }
                    className="min-h-[96px] bg-white"
                    placeholder="Escribe una observacion para el estudiante."
                  />
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <div className="text-xs text-oxfordGrey-500">
                    <p>Enviado: {new Date(idea.submittedAt).toLocaleDateString("es-CO")}</p>
                    <p>Actualizado: {new Date(idea.updatedAt).toLocaleDateString("es-CO")}</p>
                  </div>
                  <Button type="button" disabled={isPending} onClick={() => handleSave(idea.id)}>
                    {isPending ? "Guardando..." : "Guardar cambio"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
