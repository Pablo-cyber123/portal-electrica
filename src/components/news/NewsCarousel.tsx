"use client"
import { motion } from "framer-motion"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { TransitionLink } from "@/components/transitions/TransitionLink"

export type NewsItem = {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  linkUrl?: string | null
  videoUrl?: string | null
  date: string
}

export function NewsCarousel({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return <p className="text-oxfordGrey-400">No hay noticias por el momento.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ y: -10, scale: 1.03 }}
          className="cursor-pointer h-full"
        >
          <TransitionLink href={`/noticia/${item.id}`} className="block h-full">
            <Card className="h-full bg-white border-oxfordGrey-200 hover:border-utsGreen-800 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl">
              {item.imageUrl && (
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
              )}
              <div className={`absolute inset-0 z-10 ${item.imageUrl ? 'bg-gradient-to-t from-oxfordGrey-900 via-oxfordGrey-900/60 to-transparent' : 'bg-gradient-to-t from-utsGreen-800/10 to-transparent'}`} />
              <CardContent className="p-6 relative z-20 flex flex-col justify-end h-full min-h-[300px]">
                <div className={`text-sm font-bold mb-2 tracking-widest ${item.imageUrl ? 'text-utsGreen-300' : 'text-utsGreen-800'}`}>{item.date}</div>
                <CardTitle className={`text-xl leading-snug group-hover:text-utsGreen-300 transition-colors ${item.imageUrl ? 'text-white' : 'text-oxfordGrey-900'}`}>
                  {item.title}
                </CardTitle>
                <p className={`mt-2 line-clamp-2 text-sm ${item.imageUrl ? 'text-gray-300' : 'text-oxfordGrey-500'}`}>
                  {item.content}
                </p>
                {item.linkUrl && (
                  <span className={`text-xs mt-2 block break-all p-1 rounded font-mono ${item.imageUrl ? 'text-utsGreen-300 bg-black/40' : 'text-utsGreen-700 bg-utsGreen-50'}`}>
                    Enlace: {item.linkUrl}
                  </span>
                )}
                <span className={`text-xs mt-4 uppercase tracking-wider font-bold group-hover:underline ${item.imageUrl ? 'text-utsGreen-300' : 'text-utsGreen-800'}`}>Leer Completa →</span>
              </CardContent>
            </Card>
          </TransitionLink>
        </motion.div>
      ))}
    </div>
  )
}
