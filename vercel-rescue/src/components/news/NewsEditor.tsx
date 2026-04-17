"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createNewsAction } from "@/actions/news"
import { motion, AnimatePresence } from "framer-motion"

export function NewsEditor() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    try {
      await createNewsAction(formData)
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al publicar la noticia.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="bg-utsGreen-800 text-white hover:bg-utsGreen-700">
          Publicar Nueva Noticia en Inicio
        </Button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-utsGreen-800/30 shadow-lg">
              <CardHeader>
                <CardTitle>Editor de Noticias (Carrusel Home)</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-oxfordGrey-500 mb-1 block">Título</label>
                    <input name="title" required minLength={5} className="w-full bg-oxfordGrey-50 p-2 rounded-md border border-oxfordGrey-200 text-oxfordGrey-900 focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-oxfordGrey-500 mb-1 block">Resumen / Contenido</label>
                    <textarea name="content" required minLength={10} rows={3} className="w-full bg-oxfordGrey-50 p-2 rounded-md border border-oxfordGrey-200 text-oxfordGrey-900 focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-oxfordGrey-500 mb-1 block">Subir Imagen desde Archivo (Recomendado)</label>
                    <input 
                      name="imageFile" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="w-full bg-oxfordGrey-50 p-2 rounded-md border border-oxfordGrey-200 text-oxfordGrey-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-utsGreen-800 file:text-white hover:file:bg-utsGreen-700 cursor-pointer" 
                    />
                  </div>

                  {previewUrl && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-utsGreen-800/30">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-oxfordGrey-500 mb-1 block">O URL de Imagen (Alternativo)</label>
                    <input name="imageUrl" type="url" placeholder="https://ejemplo.com/imagen.jpg" className="w-full bg-oxfordGrey-50 p-2 rounded-md border border-oxfordGrey-200 text-oxfordGrey-900 focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-oxfordGrey-500 mb-1 block">Enlace a Noticia Externa (Opcional)</label>
                    <input name="linkUrl" type="url" placeholder="https://ejemplo.com/noticia-completa" className="w-full bg-oxfordGrey-50 p-2 rounded-md border border-oxfordGrey-200 text-oxfordGrey-900 focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm text-oxfordGrey-500 mb-1 block">URL de Video (YouTube/Direct) (Opcional)</label>
                    <input name="videoUrl" type="url" placeholder="https://youtube.com/watch?..." className="w-full bg-oxfordGrey-50 p-2 rounded-md border border-oxfordGrey-200 text-oxfordGrey-900 focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 outline-none transition-all" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={loading} className="bg-utsGreen-800 hover:bg-utsGreen-700 text-white">
                      {loading ? "Publicando..." : "Publicar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
