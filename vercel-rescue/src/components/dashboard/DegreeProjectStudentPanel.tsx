"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Bell, Clock3, FileText, SendHorizontal } from "lucide-react"
import { submitDegreeProjectIdeaAction, markStudentNotificationAsReadAction } from "@/actions/degree-project"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

type IdeaData = {
  id: string
  title: string
  summary: string
  documentUrl: string
  fileName: string | null
  status: string
  teacherFeedback: string | null
  submittedAt: string
  reviewedAt: string | null
  reviewedByName: string | null
}

type NotificationData = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case "APROBADA":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "REQUIERE_AJUSTES":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "RECHAZADA":
      return "bg-red-50 text-red-700 border-red-200"
    case "EN_REVISION":
      return "bg-blue-50 text-blue-700 border-blue-200"
    default:
      return "bg-oxfordGrey-100 text-oxfordGrey-700 border-oxfordGrey-200"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDIENTE_REVISION":
      return "Pendiente de revision"
    case "EN_REVISION":
      return "En revision"
    case "APROBADA":
      return "Aprobada"
    case "REQUIERE_AJUSTES":
      return "Requiere ajustes"
    case "RECHAZADA":
      return "Rechazada"
    default:
      return status
  }
}

type Props = {
  deadlineText: string
  daysRemaining: number
  canSubmit: boolean
  idea: IdeaData | null
  notifications: NotificationData[]
}

export function DegreeProjectStudentPanel({
  deadlineText,
  daysRemaining,
  canSubmit,
  idea,
  notifications
}: Props) {
  const router = useRouter()
  const [isSubmitting, startSubmitTransition] = useTransition()
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)

    startSubmitTransition(async () => {
      try {
        await submitDegreeProjectIdeaAction(formData)
        setSuccess("La idea de proyecto fue enviada correctamente.")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "No fue posible enviar la idea.")
      }
    })
  }

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingId(notificationId)
    try {
      await markStudentNotificationAsReadAction(notificationId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar la notificacion.")
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <div className="space-y-6">
        <Card className="border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-utsGreen-800" />
              Entrega de idea de grado
            </CardTitle>
            <p className="text-sm text-oxfordGrey-500">
              Fecha limite: {deadlineText}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-utsGreen-200 bg-utsGreen-50 p-4">
              <p className="text-sm text-oxfordGrey-600">Dias restantes</p>
              <p className="text-4xl font-black text-utsGreen-800">
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
              <p className="mt-1 text-xs text-oxfordGrey-500">
                {canSubmit
                  ? "Todavia puedes subir o reemplazar tu documento."
                  : "La ventana de entrega ya cerro."}
              </p>
            </div>

            {idea ? (
              <div className="rounded-xl border border-oxfordGrey-200 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-oxfordGrey-900">{idea.title}</h3>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(idea.status)}`}>
                    {getStatusLabel(idea.status)}
                  </span>
                </div>
                <p className="text-sm text-oxfordGrey-600">{idea.summary}</p>
                <div className="flex flex-wrap gap-4 text-xs text-oxfordGrey-500">
                  <span>Enviado: {mounted ? new Date(idea.submittedAt).toLocaleString("es-CO") : "..."}</span>
                  {idea.reviewedAt ? <span>Revisado: {mounted ? new Date(idea.reviewedAt).toLocaleString("es-CO") : "..."}</span> : null}
                  {idea.reviewedByName ? <span>Profesor: {idea.reviewedByName}</span> : null}
                </div>
                <Link href={idea.documentUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-utsGreen-800 hover:underline">
                  <FileText className="h-4 w-4" />
                  {idea.fileName || "Ver documento enviado"}
                </Link>
                {idea.teacherFeedback ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <span className="font-bold">Observacion del profesor:</span> {idea.teacherFeedback}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-oxfordGrey-200 p-4 text-sm text-oxfordGrey-500">
                Aun no has enviado tu idea de proyecto de grado.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SendHorizontal className="h-5 w-5 text-utsGreen-800" />
              Subir idea de proyecto
            </CardTitle>
            <p className="text-sm text-oxfordGrey-500">
              Adjunta un archivo PDF o Word con tu propuesta inicial.
            </p>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-oxfordGrey-700">Titulo</label>
                <Input name="title" defaultValue={idea?.title ?? ""} placeholder="Ej. Sistema de monitoreo energetico para laboratorios" disabled={!canSubmit || isSubmitting} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-oxfordGrey-700">Resumen</label>
                <Textarea name="summary" defaultValue={idea?.summary ?? ""} placeholder="Describe el problema, objetivo y alcance inicial de la idea." className="min-h-[130px]" disabled={!canSubmit || isSubmitting} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-oxfordGrey-700">Documento</label>
                <Input name="file" type="file" accept=".pdf,.doc,.docx" disabled={!canSubmit || isSubmitting} required={canSubmit} />
              </div>
              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
              <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full">
                {isSubmitting ? "Enviando..." : idea ? "Actualizar idea enviada" : "Enviar idea de proyecto"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-oxfordGrey-200 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-utsGreen-800" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-oxfordGrey-500">Todavia no tienes cambios de estado notificados.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`rounded-xl border p-4 ${notification.isRead ? "border-oxfordGrey-200 bg-white" : "border-utsGreen-200 bg-utsGreen-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-oxfordGrey-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-oxfordGrey-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-oxfordGrey-400">{mounted ? new Date(notification.createdAt).toLocaleString("es-CO") : "..."}</p>
                  </div>
                  {!notification.isRead ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={markingId === notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      {markingId === notification.id ? "..." : "Leida"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
