"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ExternalLink, X, ChevronLeft, ChevronRight, Facebook, Calendar, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getFacebookPosts } from "@/actions/facebook"

interface FacebookPost {
  id: string
  title: string
  date: string
  time: string
  modality: string
  speaker: string
  content: string
  images: string[]
  url: string
}

// ─── Image Carousel (used both in card and in modal) ─────────────────────────
function ImageCarousel({
  images,
  title,
  autoPlay = false,
  isHovered = false,
  fill = false,
  intervalMs = 3500,
  className = "",
}: {
  images: string[]
  title: string
  autoPlay?: boolean
  isHovered?: boolean
  fill?: boolean
  intervalMs?: number
  className?: string
}) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const next = useCallback(() => setCurrent(p => (p + 1) % images.length), [images.length])
  const prev = useCallback(() => setCurrent(p => (p - 1 + images.length) % images.length), [images.length])

  // Auto-play — only when hovered (for cards) or always (for modal)
  useEffect(() => {
    if (!autoPlay || !isHovered || images.length <= 1) return
    timerRef.current = setInterval(next, intervalMs)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay, images.length, next, intervalMs])

  // Reset on images change
  useEffect(() => { setCurrent(0) }, [images])

  return (
    <div className={`relative overflow-hidden select-none ${className}`}>
      {/* Slides */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.a
          key={current}
          href={images[current]}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0 block cursor-zoom-in group/img"
        >
          <img
            src={images[current]}
            alt={`${title} - ${current + 1}`}
            className={`w-full h-full ${fill ? "object-cover" : "object-contain"} transition-transform duration-500`}
            draggable={false}
          />
        </motion.a>
      </AnimatePresence>

      {/* Nav buttons — only if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setCurrent(i) }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Post Card ───────────────────────────────────────────────────────────────
function PostCard({ post, onClick }: { post: FacebookPost; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer flex flex-col group hover:shadow-xl hover:border-utsGreen-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-52 bg-gray-900 shrink-0">
        <ImageCarousel images={post.images} title={post.title} autoPlay isHovered={hovered} className="h-full" />
        {/* FB badge */}
        <div className="absolute top-3 left-3 z-10 bg-[#1877F2] text-white rounded-full p-1.5 shadow-lg">
          <Facebook className="w-3.5 h-3.5" />
        </div>
        {post.images.length > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {post.images.length} fotos
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="bg-utsGreen-500/90 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
              Ver publicación
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-utsGreen-700 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1 mb-3">
          {post.content}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 border-t border-gray-100 pt-3 mt-auto">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {post.time}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Post Detail Modal ────────────────────────────────────────────────────────
function PostModal({ post, onClose }: { post: FacebookPost; onClose: () => void }) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-gray-100 text-gray-700 p-1.5 rounded-full shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Left: Carousel ─────────────── */}
        <div className="w-full md:w-[55%] bg-gray-900 relative shrink-0 h-64 md:h-auto">
          <ImageCarousel
            images={post.images}
            title={post.title}
            autoPlay
            isHovered={true}
            fill={false}
            intervalMs={4000}
            className="absolute inset-0 h-full w-full"
          />
          {/* Gradient bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {/* Image count badge */}
          {post.images.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {post.images.length} imágenes
            </div>
          )}
        </div>

        {/* ── Right: Info ─────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-[#1877F2] text-white rounded-full p-1.5">
                <Facebook className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-[#1877F2]">Ingeniería Eléctrica UTS</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">{post.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.time}</span>
            </div>
          </div>

          {/* Body — full text, scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
              {post.content}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              <Facebook className="w-4 h-4" />
              Ver en Facebook
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          <div className="h-52 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FacebookFeed() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<FacebookPost | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await getFacebookPosts()
        if (!active) return
        if (res.data && res.data.length > 0) {
          setPosts(res.data)
        } else {
          setPosts(getMocks())
        }
      } catch {
        if (active) setPosts(getMocks())
      } finally {
        if (active) setLoading(false)
      }
    }

    function getMocks(): FacebookPost[] {
      return Array.from({ length: 8 }).map((_, i) => ({
        id: `mock-${i}`,
        title: i % 2 === 0 ? `Charla: Arco Eléctrico ${i + 1}` : `Taller de Circuitos ${i + 1}`,
        date: `${24 + (i % 5)}/03/2026`,
        time: `${10 + (i % 6)}:00`,
        modality: i % 3 === 0 ? "Presencial" : "Virtual (Teams)",
        speaker: i % 2 === 0 ? "Ing. Hency Roballo" : "Ing. Roberto Carlos",
        content: `Descripción detallada de la publicación número ${i + 1}.`,
        images: [
          `https://picsum.photos/seed/uts-${i}a/800/600`,
          `https://picsum.photos/seed/uts-${i}b/800/600`,
        ],
        url: "https://www.facebook.com/IngenieriaElectricaUTS",
      }))
    }

    load()
    return () => { active = false }
  }, [])

  return (
    <div className="w-full">
      {loading ? (
        <Skeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
