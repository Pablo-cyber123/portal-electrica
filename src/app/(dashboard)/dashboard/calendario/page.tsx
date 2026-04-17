import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CalendarDays, Flag, GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AcademicCalendar } from "@/components/dashboard/AcademicCalendar"

export const dynamic = "force-dynamic"

const DEFAULT_PROJECT_DEADLINE = new Date("2026-03-14T23:59:59-05:00")

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)

const formatRange = (start: Date, end?: Date | null) => {
  if (!end) return formatDate(start)
  return `${formatDate(start)} - ${formatDate(end)}`
}

const sourceLabel = (url: string) => {
  if (url.includes("gamma.site")) return "Comite trabajos de grado"
  if (url.includes("uts.edu.co")) return "Calendario UTS"
  return "Fuente oficial"
}

export default async function CalendarioPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [activeProjectWindow, events] = await Promise.all([
    prisma.degreeProjectSubmissionWindow.findFirst({
      where: { isActive: true },
      orderBy: { submissionDeadline: 'asc' }
    }),
    prisma.academicEvent.findMany({
      orderBy: { startDate: 'asc' }
    })
  ])

  const deadline = activeProjectWindow?.submissionDeadline 
    ? new Date(activeProjectWindow.submissionDeadline) 
    : DEFAULT_PROJECT_DEADLINE
  
  const diffMs = deadline.getTime() - Date.now()
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  const now = new Date()
  
  const nextParcial = events.find(
    (event) => event.category === "Parciales" && new Date(event.startDate) >= now
  )
  const nextEvent = events.find((event) => new Date(event.startDate) >= now)
  
  const serializedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    category: event.category,
    startDate: new Date(event.startDate).toISOString(),
    endDate: event.endDate ? new Date(event.endDate).toISOString() : null,
    sourceUrl: event.sourceUrl
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-oxfordGrey-900">Calendario</h1>
        <p className="text-sm text-oxfordGrey-500">Fechas clave del semestre 2026-1.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-utsGreen-600" />
              Entrega idea de proyecto de grado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-oxfordGrey-500">Fecha limite: {formatDate(deadline)}</p>
            <p className="text-3xl font-black text-utsGreen-700">{daysRemaining} dias</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-utsGreen-600" />
              Proximo parcial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextParcial ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-oxfordGrey-900">{nextParcial.title}</p>
                <p className="text-sm text-oxfordGrey-500">
                  {formatRange(new Date(nextParcial.startDate), nextParcial.endDate ? new Date(nextParcial.endDate) : null)} |{" "}
                  {sourceLabel(nextParcial.sourceUrl)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-oxfordGrey-500">No hay parciales futuros cargados.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-utsGreen-600" />
              Proxima fecha clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextEvent ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-oxfordGrey-900">{nextEvent.title}</p>
                <p className="text-sm text-oxfordGrey-500">
                  {formatRange(new Date(nextEvent.startDate), nextEvent.endDate ? new Date(nextEvent.endDate) : null)} | {sourceLabel(nextEvent.sourceUrl)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-oxfordGrey-500">No hay fechas futuras cargadas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AcademicCalendar events={serializedEvents} />
    </div>
  )
}
