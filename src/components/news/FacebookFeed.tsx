"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Calendar, Clock, Video, User, X, ChevronRight, Image as ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getFacebookPosts } from "@/actions/facebook"

interface FacebookPost {
  id: string;
  title: string;
  date: string;
  time: string;
  modality: string;
  speaker: string;
  content: string;
  images: string[];
  url: string;
}

export function FacebookFeed() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<FacebookPost | null>(null)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFacebookData() {
      // 1. Intentar cargar desde la API Real
      const response = await getFacebookPosts();
      
      if (response.data && response.data.length > 0) {
        setPosts(response.data);
      } else {
        // 2. Si falla (por falta de tokens), cargamos los datos de prueba
        console.warn("No se pudo cargar FB real, usando datos de prueba:", response.error);
        const mockPosts: FacebookPost[] = Array.from({ length: 10 }).map((_, i) => ({
          id: `mock-${i + 1}`,
          title: i % 2 === 0 ? `Charla: Arco Eléctrico ${i + 1}` : `Taller de Circuitos ${i + 1}`,
          date: `${24 + (i % 5)}/03/2026`,
          time: `${10 + (i % 6)}:00`,
          modality: i % 3 === 0 ? "Presencial" : "Virtual (Teams)",
          speaker: i % 2 === 0 ? "Ing. Hency Roballo" : "Ing. Roberto Carlos",
          content: `Esta es la descripción detallada de la publicación ${i + 1}. Aquí iría todo el texto descriptivo del evento, los objetivos, la invitación formal y cualquier otro detalle importante que se haya compartido originalmente en la publicación de Facebook. ¡Los esperamos!`,
          images: [
            `https://picsum.photos/seed/uts-fb-portada-${i}/800/600`,
            `https://picsum.photos/seed/uts-fb-galeria-${i}/800/600`,
            `https://picsum.photos/seed/uts-fb-extra-${i}/800/600`
          ],
          url: "https://www.facebook.com/IngenieriaElectricaUTS"
        }));
        setPosts(mockPosts);
      }
      setLoading(false);
    }

    fetchFacebookData();
  }, [])

  // Evitar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (selectedPost || enlargedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost, enlargedImage]);

  return (
    <div className="w-full max-w-7xl mx-auto mb-20">
      <div className="flex items-center gap-2 mb-8 px-5">
        <div className="w-3 h-3 rounded-full bg-utsGreen-500 shadow-md border border-utsGreen-200"></div>
        <h3 className="font-bold text-oxfordGrey-900 text-2xl">Últimas Publicaciones (Facebook)</h3>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
           <div className="w-12 h-12 border-4 border-utsGreen-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-5">
           {posts.map(post => (
             <div 
               key={post.id} 
               onClick={() => setSelectedPost(post)}
               className="bg-white rounded-[10px] text-oxfordGrey-900 p-5 shadow-md border border-utsGreen-200 transition-transform duration-300 hover:scale-[1.03] flex flex-col h-full cursor-pointer group"
             >
               <div className="relative overflow-hidden rounded-[10px] mb-4 h-48">
                 <img 
                   src={post.images[0]} 
                   alt={post.title}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-oxfordGrey-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-utsGreen-500 text-white px-4 py-2 rounded-full font-bold text-sm">Ver Detalles</span>
                 </div>
               </div>
               
               <h3 className="text-lg font-bold mb-4 text-utsGreen-600 line-clamp-2">{post.title}</h3>
               
               <div className="space-y-2 mb-4 flex-1 text-sm text-oxfordGrey-700">
                 <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-utsGreen-600"/> {post.date}</p>
                 <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-utsGreen-600"/> {post.time}</p>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* Modal de Detalles de la Publicación */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-utsGreen-200 overflow-hidden flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 bg-oxfordGrey-200 hover:bg-utsGreen-500 text-oxfordGrey-900 hover:text-white p-2 rounded-full transition-colors"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Lado Izquierdo: Imágenes */}
              <div className="w-full md:w-1/2 bg-oxfordGrey-50 border-r border-utsGreen-200 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                 <h4 className="text-utsGreen-600 font-bold text-lg flex items-center gap-2 mb-2"><ImageIcon className="w-5 h-5"/> Galería</h4>
                 {selectedPost.images.map((img, idx) => (
                   <div 
                     key={idx} 
                     className="relative cursor-zoom-in group rounded-xl overflow-hidden border border-oxfordGrey-200"
                     onClick={() => setEnlargedImage(img)}
                   >
                     <img src={img} alt={`${selectedPost.title} - Imagen ${idx + 1}`} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-utsGreen-500/0 group-hover:bg-utsGreen-500/20 transition-colors flex items-center justify-center">
                        <span className="bg-black/70 text-oxfordGrey-900 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Click para ampliar</span>
                     </div>
                   </div>
                 ))}
              </div>

              {/* Lado Derecho: Información */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar flex flex-col">
                <p className="text-utsGreen-600 font-mono text-sm mb-2">{selectedPost.date} • {selectedPost.time}</p>
                <h2 className="text-3xl font-black text-oxfordGrey-900 mb-6 leading-tight">{selectedPost.title}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-oxfordGrey-50 p-4 rounded-xl border border-oxfordGrey-200">
                  <div>
                    <span className="text-oxfordGrey-500 text-xs uppercase tracking-wider">Modalidad</span>
                    <p className="text-oxfordGrey-900 font-medium flex items-center gap-2 mt-1"><Video className="w-4 h-4 text-utsGreen-600"/> {selectedPost.modality}</p>
                  </div>
                  <div>
                    <span className="text-oxfordGrey-500 text-xs uppercase tracking-wider">Ponente</span>
                    <p className="text-oxfordGrey-900 font-medium flex items-center gap-2 mt-1"><User className="w-4 h-4 text-utsGreen-600"/> {selectedPost.speaker}</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-oxfordGrey-700 mb-8 flex-1">
                  <p className="whitespace-pre-line leading-relaxed text-lg">
                    {selectedPost.content}
                  </p>
                </div>

                <a 
                  href={selectedPost.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-utsGreen-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-utsGreen-600 shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-auto"
                >
                  Continuar en Facebook <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Imagen Superpuesta (Lightbox) */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-oxfordGrey-900/95 backdrop-blur-xl cursor-zoom-out p-4"
            onClick={() => setEnlargedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-oxfordGrey-500 hover:text-oxfordGrey-900 transition-colors"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={enlargedImage} 
              alt="Imagen ampliada" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Permite descargar o arrastrar si se desea
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

