"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { getDocumentCategories, uploadDocumentAction, checkDuplicateDocument } from "@/actions/documents";
import { useRouter } from "next/navigation";

export function DocumentUploader() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    getDocumentCategories().then((cats: string[]) => {
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    if (!fileUrl || !title) return;
    const cat = isNewCategory ? newCategoryName : selectedCategory;
    if (!cat) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate URL format
    try {
      new URL(fileUrl);
    } catch {
      setError("La URL ingresada no es válida. Asegúrate de copiar el enlace completo de OneDrive.");
      setLoading(false);
      return;
    }

    // Initial silent duplicate check
    if (!force) {
      const isDup = await checkDuplicateDocument(title);
      if (isDup) {
        setDuplicateWarning(`El documento con título "${title}" ya se encuentra en la base documental. ¿Quieres subir uno nuevo de todas formas?`);
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", cat);
    formData.append("fileUrl", fileUrl);
    formData.append("allowDuplicate", force ? "true" : "false");

    try {
      await uploadDocumentAction(formData);
      // Reset form
      setTitle("");
      setFileUrl("");
      setNewCategoryName("");
      setIsNewCategory(false);
      setDuplicateWarning(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      router.refresh();
      getDocumentCategories().then((cats: string[]) => setCategories(cats));
    } catch (err: any) {
      if (err.message === "DUPLICATE_FOUND") {
        setDuplicateWarning(`El documento "${title}" ya está. ¿Desea continuar?`);
      } else {
        setError(err.message || "Ocurrió un error inesperado al registrar el documento.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-oxfordGrey-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-utsGreen-800" /> Registrar Documento (OneDrive)
        </CardTitle>
        <p className="text-sm text-oxfordGrey-500">
          Sube el archivo a OneDrive, copia el enlace de compartir y pégalo aquí.
        </p>
      </CardHeader>
      <CardContent>

        {/* How-to banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <div>
            <p className="font-semibold mb-0.5">¿Cómo obtener el enlace de OneDrive?</p>
            <ol className="list-decimal ml-4 space-y-0.5">
              <li>Sube el archivo a tu OneDrive o SharePoint.</li>
              <li>Haz clic derecho → <strong>Compartir</strong> → <strong>Copiar vínculo</strong>.</li>
              <li>Asegúrate de que el permiso sea <strong>"Cualquiera con el vínculo puede ver"</strong>.</li>
              <li>Pega el enlace en el campo de abajo.</li>
            </ol>
          </div>
        </div>

        {duplicateWarning ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-900">{duplicateWarning}</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white w-full">
                Sí, registrar de todas formas
              </Button>
              <Button type="button" variant="outline" onClick={() => setDuplicateWarning(null)} disabled={loading} className="w-full">
                Cancelar
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
                placeholder="Ej. Reglamento Académico 2025"
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
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">
                Enlace de OneDrive / SharePoint
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oxfordGrey-400" />
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  required
                  className="w-full bg-white border border-oxfordGrey-200 rounded-lg pl-10 pr-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                  placeholder="https://1drv.ms/... o https://univ-my.sharepoint.com/..."
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            {success && <p className="text-green-600 text-xs font-medium">✅ Documento registrado exitosamente.</p>}

            <Button type="submit" disabled={loading} className="w-full bg-utsGreen-800 hover:bg-utsGreen-900 text-white font-bold tracking-wide">
              {loading ? "Registrando..." : "Registrar en Base Documental"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
