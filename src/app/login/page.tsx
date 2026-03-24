"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Mail, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError("Credenciales inválidas. Por favor intente de nuevo.")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-utsGreen-800 via-utsGreen-900 to-utsGreen-950 flex items-center justify-center p-4">
      
      {/* Elemento decorativo */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-utsGreen-300 rounded-full blur-[150px] mix-blend-screen opacity-15" />

      <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center justify-center gap-2 font-bold tracking-tighter text-2xl text-white mb-8 hover:text-utsGreen-300 transition-colors">
          <Zap className="h-6 w-6 text-utsGreen-300" /> UTS<span className="text-white/60 font-normal">ELÉCTRICA</span>
        </Link>

        <div className="bg-white border border-oxfordGrey-200 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-oxfordGrey-900 mb-2">Iniciar Sesión</h2>
          <p className="text-oxfordGrey-400 text-sm mb-6">Accede a tu panel institucional.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-oxfordGrey-700 block mb-1.5">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-oxfordGrey-300 w-5 h-5" />
                <input 
                  type="email" 
                  required
                   value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-oxfordGrey-50 border border-oxfordGrey-200 text-oxfordGrey-900 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 transition-all font-sans"
                  placeholder="usuario@uts.edu.co"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-oxfordGrey-700 block mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-oxfordGrey-300 w-5 h-5" />
                <input 
                  type="password"
                  required
                   value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-oxfordGrey-50 border border-oxfordGrey-200 text-oxfordGrey-900 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-6 mt-4 text-sm tracking-wide rounded-lg font-bold shadow-lg bg-utsGreen-800 hover:bg-utsGreen-700 text-white">
              {loading ? "Verificando..." : "Acceder al Portal"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
