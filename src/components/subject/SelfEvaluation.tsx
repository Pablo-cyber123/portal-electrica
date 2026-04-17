"use client"

import { useState } from "react"
import { upsertSelfEvaluationAction } from "@/actions/grades"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Star } from "lucide-react"

interface SelfEvaluationProps {
  enrollmentId: string
  subjectId: string
  cutNumber: number
  initialScore?: number
}

export function SelfEvaluation({ enrollmentId, subjectId, cutNumber, initialScore }: SelfEvaluationProps) {
  const [score, setScore] = useState(initialScore?.toString() || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const num = Number(score)
    if (isNaN(num) || num < 0 || num > 5) {
      toast.error("Por favor ingresa una nota válida entre 0 y 5")
      return
    }

    setLoading(true)
    try {
      await upsertSelfEvaluationAction(enrollmentId, subjectId, cutNumber, num)
      toast.success(`Autoevaluación del Corte ${cutNumber} guardada.`)
    } catch (err: any) {
      toast.error(err.message || "Error al guardar autoevaluación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-utsGreen-50/50 rounded-2xl border border-utsGreen-200 shadow-sm transition-all hover:bg-utsGreen-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Star className="w-4 h-4 text-utsGreen-600 fill-utsGreen-600" />
           <span className="text-xs font-black text-utsGreen-900 uppercase tracking-tighter">Tu Autoevaluación (10%)</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="0.0 - 5.0"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="h-10 bg-white border-utsGreen-200 text-sm font-bold focus:ring-utsGreen-500 rounded-xl"
          disabled={loading}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !score}
          className="bg-utsGreen-800 hover:bg-utsGreen-950 text-white rounded-xl h-10 px-6 font-bold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
        </Button>
      </div>
      <p className="text-[10px] text-utsGreen-700 italic">
        Esta nota representa el 10% de tu calificación final del corte.
      </p>
    </div>
  )
}
