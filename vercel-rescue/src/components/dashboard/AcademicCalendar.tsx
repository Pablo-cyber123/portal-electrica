"use client"

import { useMemo, useState } from "react"

type CalendarEvent = {
  id: string
  title: string
  category: string
  startDate: string
  endDate?: string | null
  sourceUrl: string
}

const weekdayLabels = ["do", "lu", "ma", "mi", "ju", "vi", "sa"]

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(date)

const parseDate = (value: string) => new Date(value)

const eventMatchesDay = (event: CalendarEvent, day: Date) => {
  const start = startOfDay(parseDate(event.startDate))
  const end = event.endDate ? startOfDay(parseDate(event.endDate)) : start
  return day >= start && day <= end
}

type Props = {
  events: CalendarEvent[]
}

export function AcademicCalendar({ events }: Props) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [activeDate, setActiveDate] = useState<Date>(today)
  const [viewDate, setViewDate] = useState<Date>(today)

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const startWeekDay = firstDayOfMonth.getDay()
    const gridStart = addDays(firstDayOfMonth, -startWeekDay)
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  }, [viewDate])

  const eventsForDay = useMemo(
    () => events.filter((event) => eventMatchesDay(event, activeDate)),
    [events, activeDate]
  )

  const eventCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const event of events) {
      const start = startOfDay(parseDate(event.startDate))
      const end = event.endDate ? startOfDay(parseDate(event.endDate)) : start
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const key = d.toISOString().slice(0, 10)
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return counts
  }, [events])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <div className="rounded-3xl border border-oxfordGrey-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-oxfordGrey-500">Calendario</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-oxfordGrey-200 text-sm text-oxfordGrey-500 transition hover:bg-oxfordGrey-50"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={() => { setViewDate(today); setActiveDate(today); }}
              className="flex h-8 items-center justify-center rounded-full border border-oxfordGrey-200 px-4 text-xs font-semibold text-oxfordGrey-500 transition hover:bg-oxfordGrey-50"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-oxfordGrey-200 text-sm text-oxfordGrey-500 transition hover:bg-oxfordGrey-50"
            >
              {">"}
            </button>
          </div>
        </div>

        <h2 className="mt-2 text-lg font-black text-oxfordGrey-900 capitalize">{monthLabel(viewDate)}</h2>

        <div className="mt-4 grid grid-cols-7 gap-2 text-[11px] uppercase text-oxfordGrey-400">
          {weekdayLabels.map((label) => (
            <div key={label} className="text-center">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const key = day.toISOString().slice(0, 10)
            const isToday = sameDay(day, today)
            const isActive = sameDay(day, activeDate)
            const inMonth = day.getMonth() === viewDate.getMonth()
            const count = eventCounts.get(key) ?? 0
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDate(day)}
                className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                  isActive
                    ? "border-utsGreen-300 bg-utsGreen-50 text-utsGreen-700"
                    : "border-transparent hover:border-oxfordGrey-200 hover:bg-oxfordGrey-50"
                } ${inMonth ? "text-oxfordGrey-900" : "text-oxfordGrey-300"} ${
                  isToday && !isActive ? "ring-2 ring-utsGreen-100" : ""
                }`}
              >
                {day.getDate()}
                {count > 0 ? (
                  <span className="absolute -bottom-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-utsGreen-600 px-1 text-[10px] font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-oxfordGrey-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-oxfordGrey-400">Agenda</p>
            <h3 className="text-lg font-black text-oxfordGrey-900">{formatDate(activeDate)}</h3>
          </div>
          <span className="rounded-full bg-utsGreen-50 px-3 py-1 text-xs font-semibold text-utsGreen-700">
            {eventsForDay.length} actividades
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {eventsForDay.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-oxfordGrey-200 px-4 py-6 text-sm text-oxfordGrey-500">
              No hay actividades para este dia.
            </div>
          ) : (
            eventsForDay.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-oxfordGrey-200 bg-oxfordGrey-50/40 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-oxfordGrey-900">{event.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-oxfordGrey-600">
                    {event.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-oxfordGrey-500">
                  {event.endDate
                    ? `${formatDate(parseDate(event.startDate))} - ${formatDate(
                        parseDate(event.endDate)
                      )}`
                    : formatDate(parseDate(event.startDate))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
