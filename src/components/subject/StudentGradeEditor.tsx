"use client"

import { useState, useEffect } from "react"
import { upsertGradesAction } from "@/actions/grades"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Save, Calculator, Plus, Trash2, GraduationCap } from "lucide-react"

interface StudentGradeEditorProps {
  enrollmentId: string
  subjectId: string
  cutNumber: number
  initialRawEval?: number[]
  initialRawTasks?: number[]
  initialSelfEval?: number
  studentName: string
}

export function StudentGradeEditor({ 
  enrollmentId, 
  subjectId, 
  cutNumber, 
  initialRawEval = [], 
  initialRawTasks = [], 
  initialSelfEval = 0,
  studentName 
}: StudentGradeEditorProps) {
  const [evalScores, setEvalScores] = useState<string[]>(initialRawEval.length > 0 ? initialRawEval.map(n => n.toString()) : [""])
  const [taskScores, setTaskScores] = useState<string[]>(initialRawTasks.length > 0 ? initialRawTasks.map(n => n.toString()) : [""])
  const [loading, setLoading] = useState(false)

  // Live Calculations
  const avgEval = evalScores.filter(s => s !== "").reduce((acc, curr) => acc + Number(curr), 0) / (evalScores.filter(s => s !== "").length || 1)
  const avgTask = taskScores.filter(s => s !== "").reduce((acc, curr) => acc + Number(curr), 0) / (taskScores.filter(s => s !== "").length || 1)
  const finalCut = (avgEval * 0.6) + (avgTask * 0.3) + (initialSelfEval * 0.1)

  const handleAddField = (type: 'eval' | 'task') => {
    if (type === 'eval') setEvalScores([...evalScores, ""])
    else setTaskScores([...taskScores, ""])
  }

  const handleRemoveField = (type: 'eval' | 'task', index: number) => {
    if (type === 'eval') {
      const newScores = evalScores.filter((_, i) => i !== index)
      setEvalScores(newScores.length ? newScores : [""])
    } else {
      const newScores = taskScores.filter((_, i) => i !== index)
      setTaskScores(newScores.length ? newScores : [""])
    }
  }

  const handleChange = (type: 'eval' | 'task', index: number, value: string) => {
    const num = value === "" ? "" : Math.min(5, Math.max(0, Number(value))).toString()
    if (type === 'eval') {
      const newScores = [...evalScores]
      newScores[index] = num
      setEvalScores(newScores)
    } else {
      const newScores = [...taskScores]
      newScores[index] = num
      setTaskScores(newScores)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append("enrollmentId", enrollmentId)
    formData.append("subjectId", subjectId)
    
    evalScores.forEach((s, i) => {
      if (s !== "") formData.append(`evalScoreCut_${cutNumber}_${i}`, s)
    })
    taskScores.forEach((s, i) => {
      if (s !== "") formData.append(`tasksScoreCut_${cutNumber}_${i}`, s)
    })

    try {
      await upsertGradesAction(formData)
      toast.success(`Notas de ${studentName} guardadas (Corte ${cutNumber})`)
    } catch (err: any) {
      toast.error(err.message || "Error al guardar notas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-white border border-oxfordGrey-100 rounded-3xl shadow-xl w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-utsGreen-800 flex items-center justify-center text-white">
             <Calculator className="w-5 h-5" />
           </div>
           <div>
             <span className="text-xs font-black text-oxfordGrey-400 uppercase tracking-widest block">Gestión Académica</span>
             <h3 className="text-lg font-black text-oxfordGrey-900 tracking-tight leading-none uppercase">Corte {cutNumber} - {studentName}</h3>
           </div>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black text-oxfordGrey-400 uppercase tracking-widest block mb-1">Nota Proyectada</span>
           <span className={`text-3xl font-black ${finalCut >= 3 ? 'text-utsGreen-800' : 'text-red-500'}`}>
             {finalCut.toFixed(2)}
           </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-4">
        {/* EXÁMENES (60%) */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
             <label className="text-[10px] font-black text-oxfordGrey-900 uppercase tracking-widest">Exámenes / Quices (60%)</label>
             <span className="text-[10px] font-bold text-utsGreen-600 bg-utsGreen-50 px-2 py-0.5 rounded">Prom: {avgEval.toFixed(2)}</span>
           </div>
           <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
             {evalScores.map((score, idx) => (
               <div key={`eval-${idx}`} className="flex gap-2">
                 <Input 
                   type="number"
                   step="0.1"
                   min="0"
                   max="5"
                   placeholder="0.0"
                   value={score}
                   onChange={(e) => handleChange('eval', idx, e.target.value)}
                   className="h-10 bg-oxfordGrey-50 border-oxfordGrey-100 font-bold text-sm focus:bg-white transition-colors"
                 />
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => handleRemoveField('eval', idx)}
                   className="h-10 w-10 text-oxfordGrey-300 hover:text-red-500 hover:bg-red-50"
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
             ))}
           </div>
           <Button 
             variant="outline" 
             onClick={() => handleAddField('eval')}
             className="w-full border-dashed border-2 border-oxfordGrey-200 text-oxfordGrey-400 hover:border-utsGreen-800 hover:text-utsGreen-800 h-10 text-[10px] font-black uppercase tracking-widest gap-2"
           >
             <Plus className="w-4 h-4" /> Agregar Parcial
           </Button>
        </div>

        {/* TAREAS (30%) */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
             <label className="text-[10px] font-black text-oxfordGrey-900 uppercase tracking-widest">Tareas / Talleres (30%)</label>
             <span className="text-[10px] font-bold text-utsGreen-600 bg-utsGreen-50 px-2 py-0.5 rounded">Prom: {avgTask.toFixed(2)}</span>
           </div>
           <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
             {taskScores.map((score, idx) => (
               <div key={`task-${idx}`} className="flex gap-2">
                 <Input 
                   type="number"
                   step="0.1"
                   min="0"
                   max="5"
                   placeholder="0.0"
                   value={score}
                   onChange={(e) => handleChange('task', idx, e.target.value)}
                   className="h-10 bg-oxfordGrey-50 border-oxfordGrey-100 font-bold text-sm focus:bg-white transition-colors"
                 />
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => handleRemoveField('task', idx)}
                   className="h-10 w-10 text-oxfordGrey-300 hover:text-red-500 hover:bg-red-50"
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
             ))}
           </div>
           <Button 
             variant="outline" 
             onClick={() => handleAddField('task')}
             className="w-full border-dashed border-2 border-oxfordGrey-200 text-oxfordGrey-400 hover:border-utsGreen-800 hover:text-utsGreen-800 h-10 text-[10px] font-black uppercase tracking-widest gap-2"
           >
             <Plus className="w-4 h-4" /> Agregar Parcial
           </Button>
        </div>
      </div>

      {/* AUTOEVALUACIÓN (10%) */}
      <div className="bg-oxfordGrey-900 rounded-2xl p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-utsGreen-300">
               <GraduationCap className="w-4 h-4" />
            </div>
            <div>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Subido por Alumno</span>
               <span className="text-xs font-bold text-white uppercase">Autoevaluación (10%)</span>
            </div>
         </div>
         <span className="text-2xl font-black text-utsGreen-300 italic">{initialSelfEval.toFixed(1)}</span>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-utsGreen-800 hover:bg-utsGreen-950 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-utsGreen-800/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Calificaciones Finales</>}
      </Button>
    </div>
  )
}
