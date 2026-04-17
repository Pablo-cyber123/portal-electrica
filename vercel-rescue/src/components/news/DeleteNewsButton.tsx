"use client"
import { useState, useTransition } from "react"
import { deleteNewsAction } from "@/actions/news"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, X } from "lucide-react"

export function DeleteNewsButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  
  if (confirming) {
    return (
      <div className="flex items-center gap-2 animate-fade-in-up">
        <span className="text-xs text-red-500 font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> ¿Seguro?
        </span>
        <Button 
          variant="destructive" 
          size="sm" 
          disabled={isPending}
          onClick={() => startTransition(async () => { 
            await deleteNewsAction(id); 
            setConfirming(false);
          })}
          className="bg-red-600 hover:bg-red-700 h-7 text-[10px] px-2"
        >
          Sí, eliminar
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setConfirming(false)}
          className="h-7 w-7 p-0 text-oxfordGrey-400 hover:text-oxfordGrey-900"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      disabled={isPending}
      onClick={() => setConfirming(true)}
      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-8 px-3 text-[11px] group"
    >
      <Trash2 className="w-3.5 h-3.5 mr-1.5 opacity-70 group-hover:opacity-100 transition-opacity" /> 
      Eliminar
    </Button>
  )
}
