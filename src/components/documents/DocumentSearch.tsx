"use client"

import { useState, useMemo } from 'react';
import { Search, FileText, FileSpreadsheet, File, FolderOpen, ChevronRight, Download, Eye, CalendarDays } from 'lucide-react';

export type OfficialDocument = {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  createdAt: Date;
};

export function DocumentSearch({ data }: { data: OfficialDocument[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = useMemo(() => {
    const cats: Record<string, OfficialDocument[]> = {};
    for (const doc of data) {
      if (!cats[doc.category]) cats[doc.category] = [];
      cats[doc.category].push(doc);
    }
    // Sort categories alphabetically
    return Object.keys(cats).sort().reduce((acc, current) => {
      acc[current] = cats[current];
      return acc;
    }, {} as Record<string, OfficialDocument[]>);
  }, [data]);

  const filteredDocs = searchTerm 
    ? data.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getFileIcon = (url: string) => {
    const u = url.toLowerCase();
    if (u.endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (u.endsWith('.xlsx') || u.endsWith('.xls')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (u.endsWith('.docx') || u.endsWith('.doc')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-oxfordGrey-400" />;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderDocCardStyles = "bg-white border border-oxfordGrey-200 rounded-xl p-4 hover:border-utsGreen-500 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group";

  const renderDocument = (doc: OfficialDocument) => (
    <div key={doc.id} className={renderDocCardStyles}>
      <div className="flex items-start gap-4 flex-1">
        <div className="mt-1 bg-oxfordGrey-50 p-2 rounded-lg group-hover:bg-utsGreen-50 transition-colors shrink-0">
          {getFileIcon(doc.fileUrl)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-oxfordGrey-900 group-hover:text-utsGreen-800 transition-colors leading-tight mb-1">
            {doc.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-oxfordGrey-400">
            <span className="truncate max-w-[150px] font-medium text-utsGreen-600 bg-utsGreen-50 px-2 py-0.5 rounded-full inline-block">
              {doc.category}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(doc.createdAt)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto self-end sm:self-center border-t border-oxfordGrey-100 sm:border-0 pt-3 sm:pt-0">
        <a 
          href={doc.fileUrl} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-2 text-xs font-bold text-utsGreen-700 bg-utsGreen-50 hover:bg-utsGreen-100 rounded-lg transition-colors border border-utsGreen-200"
        >
          <Eye className="w-4 h-4" /> Visualizar
        </a>
        <a 
          href={doc.fileUrl} 
          download
          target="_blank"
          rel="noreferrer"
          className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-2 text-xs font-bold text-oxfordGrey-700 hover:text-white bg-white hover:bg-oxfordGrey-800 rounded-lg transition-colors border border-oxfordGrey-200 hover:border-oxfordGrey-800"
        >
          <Download className="w-4 h-4" /> Descargar
        </a>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-8 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-oxfordGrey-400 group-focus-within:text-utsGreen-500 transition-colors" />
          </div>
          <input
             type="text"
             className="block w-full pl-11 pr-4 py-4 bg-white border-2 border-oxfordGrey-200 rounded-2xl text-oxfordGrey-900 focus:ring-0 focus:border-utsGreen-500 outline-none transition-all shadow-sm focus:shadow-md text-lg placeholder:text-oxfordGrey-400"
             placeholder="Buscar reglamentos, actas, resoluciones por título o categoría..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* Results View */}
      {searchTerm ? (
        <div className="space-y-4">
          <h3 className="font-bold text-oxfordGrey-900 border-b border-oxfordGrey-200 pb-2 mb-4">
            Resultados de Búsqueda ({filteredDocs.length})
          </h3>
          {filteredDocs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredDocs.map(renderDocument)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-oxfordGrey-200 rounded-2xl">
              <Search className="w-12 h-12 text-oxfordGrey-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-oxfordGrey-900">No se encontraron documentos</h3>
              <p className="text-oxfordGrey-500 mt-2">Intenta buscar con otros términos clave.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="font-bold text-oxfordGrey-900 border-b border-oxfordGrey-200 pb-2 mb-4">
            Explorar por Categoría
          </h3>
          <div className="space-y-3">
            {Object.entries(categories).map(([categoryName, categoryDocs], idx) => (
              <details key={idx} className="group bg-white rounded-xl border border-oxfordGrey-200 overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-oxfordGrey-50 transition-colors font-bold text-oxfordGrey-900 select-none">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-utsGreen-500 group-open:text-utsGreen-600 transition-colors" />
                    <span>{categoryName} <span className="text-oxfordGrey-400 font-normal text-sm ml-2">({categoryDocs.length})</span></span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-oxfordGrey-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-4 pt-1 bg-oxfordGrey-50/50 border-t border-oxfordGrey-100 flex flex-col gap-3">
                  {categoryDocs.map(renderDocument)}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
