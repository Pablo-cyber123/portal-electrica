"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, User, ChevronDown, GraduationCap, Calculator, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StudentGradeEditor } from "./StudentGradeEditor"

interface Student {
  id: string
  name: string
  email: string
  cc: string
  grades: any[]
}

interface StudentGradeListProps {
  students: Student[]
  subjectId: string
}

export function StudentGradeList({ students, subjectId }: StudentGradeListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [activeCut, setActiveCut] = useState<Record<string, number>>({})

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cc.includes(searchTerm)
  )

  const toggleStudent = (id: string) => {
    setExpandedStudent(expandedStudent === id ? null : id)
    if (!activeCut[id]) {
      setActiveCut(prev => ({ ...prev, [id]: 1 }))
    }
  }

  const selectCut = (studentId: string, cut: number) => {
    setActiveCut(prev => ({ ...prev, [studentId]: cut }))
  }

  const calculateFinal = (grades: any[]) => {
    const c1 = grades.find(g => g.cutNumber === 1)?.finalScore || 0
    const c2 = grades.find(g => g.cutNumber === 2)?.finalScore || 0
    const c3 = grades.find(g => g.cutNumber === 3)?.finalScore || 0
    return (c1 + c2 + c3) / 3
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Buscador Estético */}
      <div className="sticky top-4 z-30">
        <div className="relative group">
          <div className="absolute inset-0 bg-utsGreen-800/5 rounded-2xl blur-xl group-focus-within:bg-utsGreen-800/10 transition-all" />
          <div className="relative bg-white border border-oxfordGrey-100 rounded-2xl md:rounded-3xl p-1.5 md:p-2 shadow-xl flex items-center gap-2 md:gap-4 transition-all focus-within:border-utsGreen-300">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-oxfordGrey-50 rounded-xl md:rounded-2xl flex items-center justify-center text-oxfordGrey-400 group-focus-within:text-utsGreen-800 transition-colors">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <Input 
              placeholder="Buscar por cédula o nombre..." 
              className="border-none bg-transparent focus-visible:ring-0 text-base md:text-lg font-medium placeholder:text-oxfordGrey-300 px-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
               <div className="hidden sm:block pr-4 text-[9px] md:text-[10px] font-black text-utsGreen-800 uppercase tracking-widest px-3 py-1 bg-utsGreen-50 rounded-full">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'Encontrado' : 'Encontrados'}
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Listado de Estudiantes */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student) => {
            const finalGrade = calculateFinal(student.grades)
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className={`bg-white border transition-all duration-300 rounded-[28px] md:rounded-[32px] overflow-hidden ${
                  expandedStudent === student.id 
                    ? 'border-utsGreen-300 shadow-2xl shadow-utsGreen-800/5 ring-1 ring-utsGreen-50' 
                    : 'border-oxfordGrey-100 shadow-sm hover:shadow-md hover:border-oxfordGrey-200'
                }`}
              >
                {/* Header del Estudiante (Clickable) */}
                <button
                  onClick={() => toggleStudent(student.id)}
                  className="w-full p-5 md:p-8 flex items-center justify-between text-left group/btn"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl transition-all ${
                      expandedStudent === student.id 
                        ? 'bg-utsGreen-800 text-white rotate-3 scale-110' 
                        : 'bg-oxfordGrey-50 text-oxfordGrey-400 group-hover/btn:bg-utsGreen-50 group-hover/btn:text-utsGreen-800'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`text-base md:text-xl font-black uppercase tracking-tight transition-colors ${
                        expandedStudent === student.id ? 'text-utsGreen-950' : 'text-oxfordGrey-900 group-hover/btn:text-utsGreen-800'
                      }`}>
                        {student.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                         <span className="text-[9px] md:text-[10px] font-black text-oxfordGrey-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                           <User className="w-3 h-3" /> CC: {student.cc}
                         </span>
                         <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${finalGrade < 3 ? 'text-red-500' : 'text-utsGreen-600'}`}>
                            DEFINITIVA: {finalGrade.toFixed(2)}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-6">
                     <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[8px] font-black text-oxfordGrey-300 uppercase tracking-[0.2em] mb-1">Cortes</span>
                        <div className="flex gap-1.5">
                           {[1, 2, 3].map(cutNum => {
                             const hasGrade = student.grades.some(g => g.cutNumber === cutNum)
                             return (
                               <div key={cutNum} className={`w-2 h-2 rounded-full ${hasGrade ? 'bg-utsGreen-500' : 'bg-oxfordGrey-100'}`} />
                             )
                           })}
                        </div>
                     </div>
                     <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                       expandedStudent === student.id ? 'bg-utsGreen-50 text-utsGreen-800 rotate-180' : 'bg-oxfordGrey-50 text-oxfordGrey-300'
                     }`}>
                       <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                     </div>
                  </div>
                </button>

                {/* Panel de Detalles (Expansible) */}
                <AnimatePresence>
                  {expandedStudent === student.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 md:px-8 pb-8 space-y-8 border-t border-oxfordGrey-50 pt-8 bg-oxfordGrey-50/10">
                         {/* Switcher de Cortes Estético */}
                         <div className="flex flex-wrap items-center gap-2 bg-oxfordGrey-100/50 p-1.5 rounded-2xl w-fit mx-auto border border-oxfordGrey-200">
                            {[1, 2, 3].map((num) => (
                              <button
                                key={num}
                                onClick={() => selectCut(student.id, num)}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                                  activeCut[student.id] === num 
                                    ? 'bg-white text-utsGreen-800 shadow-sm border border-oxfordGrey-200 scale-105' 
                                    : 'text-oxfordGrey-400 hover:text-oxfordGrey-700'
                                }`}
                              >
                                Corte {num}
                              </button>
                            ))}
                         </div>

                       {/* Editor de Notas */}
                       <motion.div
                         key={activeCut[student.id]}
                         initial={{ x: 20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ duration: 0.3 }}
                         className="flex justify-center"
                       >
                         <StudentGradeEditor 
                            enrollmentId={student.id}
                            subjectId={subjectId}
                            cutNumber={activeCut[student.id] || 1}
                            studentName={student.name}
                            initialRawEval={student.grades.find(g => g.cutNumber === (activeCut[student.id] || 1))?.rawEvaluations || []}
                            initialRawTasks={student.grades.find(g => g.cutNumber === (activeCut[student.id] || 1))?.rawTasks || []}
                            initialSelfEval={student.grades.find(g => g.cutNumber === (activeCut[student.id] || 1))?.selfEvaluationScore || 0}
                         />
                       </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            )
          })}

          {filteredStudents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-4"
            >
               <div className="w-20 h-20 bg-oxfordGrey-50 rounded-full flex items-center justify-center mx-auto text-oxfordGrey-200">
                  <Calculator className="w-10 h-10" />
               </div>
               <p className="text-sm font-black text-oxfordGrey-400 uppercase tracking-widest">No se encontraron estudiantes para "{searchTerm}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
