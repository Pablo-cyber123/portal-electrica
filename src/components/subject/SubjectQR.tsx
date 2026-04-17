"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Share2, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SubjectQRProps {
  subjectId: string
  subjectName: string
}

export function SubjectQR({ subjectId, subjectName }: SubjectQRProps) {
  const [enrollUrl, setEnrollUrl] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEnrollUrl(`${window.location.origin}/dashboard/enroll/${subjectId}`)
    }
  }, [subjectId])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enrollUrl)
    setCopied(true)
    toast.success("Enlace de inscripción copiado")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-white border-oxfordGrey-200 shadow-xl overflow-hidden group">
      <CardHeader className="bg-oxfordGrey-900 border-b border-white/10 py-4">
        <CardTitle className="flex items-center gap-2 text-white text-base font-bold">
          <QrCode className="w-5 h-5 text-utsGreen-300" />
          Autoinscripción QR
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-oxfordGrey-50 relative group/qr">
          {enrollUrl && (
            <QRCodeSVG 
              value={enrollUrl} 
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "https://portal-electrica.vercel.app/logo-uts.png",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          )}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
            <span className="bg-oxfordGrey-900 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-lg">SCAN ME</span>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-oxfordGrey-400 uppercase tracking-widest">Enlace Directo</p>
          <div className="flex items-center gap-2 bg-oxfordGrey-50 p-2 pl-4 rounded-full border border-oxfordGrey-200 max-w-xs overflow-hidden">
            <span className="text-[10px] text-oxfordGrey-500 font-mono truncate">{enrollUrl}</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full hover:bg-white hover:shadow-md"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="w-4 h-4 text-utsGreen-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="w-full bg-utsGreen-50 p-4 rounded-xl border border-utsGreen-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-utsGreen-100 flex items-center justify-center shrink-0">
             <Share2 className="w-4 h-4 text-utsGreen-800" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-utsGreen-900">Instrucciones</p>
            <p className="text-[10px] text-utsGreen-700 leading-relaxed">
              Muestre este QR a sus alumnos. Al escanearlo, serán dirigidos a la plataforma para confirmar su inscripción automática en <strong className="text-utsGreen-900">{subjectName}</strong>.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
