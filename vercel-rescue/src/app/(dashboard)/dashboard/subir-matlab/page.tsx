"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, FileCode2, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { createMatlabProject, getMatlabProjects, deleteMatlabProject } from "@/actions/matlab"

interface ProjectItem {
  id: string
  title: string
  description: string
  functionality: string
  fileName: string
  createdAt: Date
}

export default function SubirMatlabPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [functionality, setFunctionality] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadProjects = async () => {
    const data = await getMatlabProjects()
    setProjects(data)
    setLoadingList(false)
  }

  useEffect(() => { loadProjects() }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".m")) {
      setError("Solo se permiten archivos .m de Matlab")
      return
    }

    setSelectedFile(file)
    setError(null)

    // Auto-fill title from filename if empty
    if (!title) {
      setTitle(file.name.replace(/\.m$/, "").replace(/_/g, " "))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError("Selecciona un archivo .m")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const code = await selectedFile.text()

      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("functionality", functionality)
      formData.append("code", code)
      formData.append("fileName", selectedFile.name)

      await createMatlabProject(formData)
      
      setTitle("")
      setDescription("")
      setFunctionality("")
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ""
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
      loadProjects()
    } catch (err: any) {
      setError(err.message || "Error al subir el proyecto")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return
    setDeleting(id)
    try {
      await deleteMatlabProject(id)
      loadProjects()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-oxfordGrey-900">Subir Proyecto Matlab</h1>
        <p className="text-sm text-oxfordGrey-500 mt-1">
          Sube archivos <code className="bg-oxfordGrey-100 px-1 rounded">.m</code> para que los estudiantes puedan ejecutarlos en la plataforma web.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="bg-white border-oxfordGrey-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-utsGreen-800" /> Nuevo Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Título del Proyecto</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                placeholder="Ej. Simulador de Circuito RLC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 resize-none"
                placeholder="Describe brevemente qué es este proyecto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">¿Qué realiza? (Funcionalidad)</label>
              <textarea
                value={functionality}
                onChange={e => setFunctionality(e.target.value)}
                required
                rows={3}
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 resize-none"
                placeholder="Explica qué hace el programa: simula un circuito, calcula valores, genera gráficos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Archivo Matlab (.m)</label>
              <div className="border-2 border-dashed border-oxfordGrey-200 rounded-xl p-6 text-center hover:border-utsGreen-800 transition-colors cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".m"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileCode2 className="w-5 h-5 text-utsGreen-800" />
                    <span className="text-sm font-medium text-oxfordGrey-900">{selectedFile.name}</span>
                    <span className="text-xs text-oxfordGrey-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-oxfordGrey-300 mx-auto mb-2" />
                    <p className="text-sm text-oxfordGrey-500">Haz clic o arrastra un archivo <strong>.m</strong> aquí</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="w-4 h-4" /> Proyecto subido exitosamente. Los estudiantes ya pueden acceder.
              </div>
            )}

            <Button type="submit" disabled={loading || !selectedFile} className="w-full bg-utsGreen-800 hover:bg-utsGreen-900 text-white font-bold">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Subiendo...</> : "Subir Proyecto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Projects */}
      <Card className="bg-white border-oxfordGrey-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-utsGreen-800" /> Proyectos Publicados ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingList ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-oxfordGrey-400" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-oxfordGrey-400 text-center py-8">No hay proyectos subidos aún.</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-oxfordGrey-50 rounded-xl p-4 border border-oxfordGrey-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-oxfordGrey-900 truncate">{p.title}</p>
                    <p className="text-xs text-oxfordGrey-500 truncate">{p.fileName} · {new Date(p.createdAt).toLocaleDateString("es-CO")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 ml-2"
                  >
                    {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
