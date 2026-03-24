"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, AlertTriangle } from "lucide-react";
import { getDocumentCategories, uploadDocumentAction, checkDuplicateDocument } from "@/actions/documents";
import { useRouter } from "next/navigation";

export function DocumentUploader() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    getDocumentCategories().then((cats: string[]) => {
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    if (!file || !title) return;
    const cat = isNewCategory ? newCategoryName : selectedCategory;
    if (!cat) return;

    setLoading(true);
    setError(null);

    // Initial silent check
    if (!force) {
      const isDup = await checkDuplicateDocument(title);
      if (isDup) {
        setDuplicateWarning(`El documento con título "${title}" ya se encuentra en la base documental. ¿Quiere aún así subir el documento?`);
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", cat);
    formData.append("file", file);
    formData.append("allowDuplicate", force ? "true" : "false");

    try {
      await uploadDocumentAction(formData);
      // Reset form on success
      setTitle("");
      setFile(null);
      setNewCategoryName("");
      setIsNewCategory(false);
      setDuplicateWarning(null);
      router.refresh();
      // Refetch categories in case they added a new one
      getDocumentCategories().then((cats: string[]) => setCategories(cats));
      alert("¡Documento subido con éxito!");
    } catch (err: any) {
      if (err.message === "DUPLICATE_FOUND") {
        setDuplicateWarning(`El documento "${title}" ya está. ¿Desea continuar?`);
      } else {
        setError(err.message || "Ocurrió un error inesperado al subir el documento.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-oxfordGrey-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="w-5 h-5 text-utsGreen-800" /> Cargar Documento Oficial
        </CardTitle>
        <p className="text-sm text-oxfordGrey-500">
          Sube normativas, plantillas o resoluciones al repositorio central.
        </p>
      </CardHeader>
      <CardContent>
        {duplicateWarning ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-900">{duplicateWarning}</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white w-full">
                Sí, Subir Documento
              </Button>
              <Button type="button" variant="outline" onClick={() => setDuplicateWarning(null)} disabled={loading} className="w-full">
                No, Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Título del Documento</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                placeholder="Ej. Acta de Consejo No. 5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-oxfordGrey-700">Categoría</label>
                <button
                  type="button"
                  onClick={() => setIsNewCategory(!isNewCategory)}
                  className="text-xs text-utsGreen-600 font-bold hover:underline"
                >
                  {isNewCategory ? "Seleccionar Existente" : "+ Crear Nueva"}
                </button>
              </div>
              
              {isNewCategory ? (
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                  placeholder="Escribe la nueva categoría"
                />
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Archivo PDF, Word, Excel</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="w-full text-sm text-oxfordGrey-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-utsGreen-50 file:text-utsGreen-800 hover:file:bg-utsGreen-100 transition-colors"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-utsGreen-800 hover:bg-utsGreen-900 text-white font-bold tracking-wide">
              {loading ? "Procesando..." : "Subir a Base Documental"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
