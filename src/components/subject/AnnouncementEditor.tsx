"use client"

import { useState } from "react"
import { createAnnouncementAction } from "@/actions/subject"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone, Loader2 } from "lucide-react"

export function AnnouncementEditor({ subjectId }: { subjectId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      formData.append("subjectId", subjectId)
      await createAnnouncementAction(formData)
      const form = document.getElementById("announcement-form") as HTMLFormElement
      if (form) form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border-2 border-dashed border-oxfordGrey-200 rounded-2xl p-6 mb-8 mt-2 transition-all focus-within:border-utsGreen-800/50 focus-within:bg-oxfordGrey-50">
      <h3 className="text-lg font-bold text-oxfordGrey-900 mb-4 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-utsGreen-800" /> 
        Crear Nueva Publicación
      </h3>
      
      <form id="announcement-form" action={handleSubmit} className="space-y-4">
        <div>
          <Input 
            name="title" 
            placeholder="Título del anuncio..." 
            required 
            className="font-bold"
          />
        </div>
        <div>
          <Textarea 
            name="content" 
            placeholder="Escribe los detalles, contenido, enlaces y recursos aquí..." 
            required 
            rows={4}
            className="resize-none"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
             disabled={loading}
            className="bg-utsGreen-800 hover:bg-utsGreen-700 text-white font-bold disabled:opacity-50 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar en el Muro'}
          </Button>
        </div>
      </form>
    </div>
  )
}
