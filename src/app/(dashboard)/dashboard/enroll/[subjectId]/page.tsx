"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { enrollInSubjectAction } from "@/actions/enrollment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, BookOpen, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function EnrollPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = use(params)
  const [status, setStatus] = useState<"loading" | "success" | "error" | "confirm">("confirm")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleEnroll = async () => {
    setStatus("loading")
    try {
      const result = await enrollInSubjectAction(subjectId)
      if (result.success) {
        setStatus("success")
        setMessage(result.message)
        toast.success(result.message)
      } else {
        setStatus("error")
        setMessage("Hubo un problema al inscribirte.")
      }
    } catch (err: any) {
      setStatus("error")
      setMessage(err.message || "Error inesperado.")
      toast.error(err.message || "Error al inscribir")
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-oxfordGrey-200 shadow-2xl rounded-3xl overflow-hidden animate-fade-in-up">
        <div className="bg-oxfordGrey-900 p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-utsGreen-300/10 rounded-full blur-2xl -mr-16 -mt-16" />
           <GraduationCap className="w-16 h-16 text-utsGreen-300 mx-auto mb-4 relative z-10" />
           <h1 className="text-2xl font-black text-white relative z-10 tracking-tighter">Inscripción Académica</h1>
        </div>

        <CardContent className="p-8">
          {status === "confirm" && (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-oxfordGrey-50 rounded-2xl border border-oxfordGrey-100 italic text-oxfordGrey-500 text-sm">
                Has escaneado el código QR para unirte a una nueva materia en el portal oficial de Ingeniería Eléctrica UTS.
              </div>
              <p className="text-oxfordGrey-900 font-bold">¿Deseas confirmar tu inscripción?</p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleEnroll} className="bg-utsGreen-800 hover:bg-utsGreen-950 text-white h-12 rounded-xl font-black transition-all shadow-lg hover:shadow-utsGreen-800/20">
                  SÍ, CONFIRMAR INSCRIPCIÓN
                </Button>
                <Link href="/dashboard" className="w-full">
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-oxfordGrey-400 font-bold">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-utsGreen-600 animate-spin" />
              <p className="text-oxfordGrey-400 font-bold animate-pulse">Procesando matrícula...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-utsGreen-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-utsGreen-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-oxfordGrey-900">¡Inscripción Exitosa!</h2>
                <p className="text-sm text-oxfordGrey-400 leading-relaxed">{message}</p>
              </div>
              <Link href={`/dashboard/subject/${subjectId}`}>
                <Button className="w-full bg-oxfordGrey-900 hover:bg-black text-white h-12 rounded-xl font-black mt-4 items-center gap-2">
                  IR A LA MATERIA <BookOpen className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-oxfordGrey-900">No se pudo completar</h2>
                <p className="text-sm text-red-500 font-medium px-4">{message}</p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={() => setStatus("confirm")} variant="outline" className="h-12 rounded-xl font-bold border-oxfordGrey-200">
                  Reintentar
                </Button>
                <Link href="/dashboard">
                  <Button variant="ghost" className="h-12 rounded-xl text-oxfordGrey-400 font-bold">
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
