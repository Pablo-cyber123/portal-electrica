"use client"

import { useState } from "react"
import { deleteAnnouncementAction } from "@/actions/subject"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteAnnouncementButton({ id, subjectId }: { id: string, subjectId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar esta publicación?")) return
    
    setLoading(true)
    try {
      await deleteAnnouncementAction(id, subjectId)
    } catch {
      alert("Error al eliminar la publicación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 h-auto"
      title="Eliminar publicación"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}
