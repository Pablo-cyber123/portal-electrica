"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { KeyRound, Mail, Eye, EyeOff } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError("Credenciales invalidas.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleOutlook = async () => {
    setError("")
    setLoading(true)
    const result = await signIn("azure-ad", { callbackUrl: "/dashboard" })
    if (result?.error) {
      setError("No fue posible autenticar con Outlook.")
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Iniciar sesion"
      bottomPrompt="No tienes cuenta?"
      bottomCta="Registrarme"
      bottomHref="/registro"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-5"
      >
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-oxfordGrey-700">Correo</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oxfordGrey-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white pl-12 pr-4 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
              placeholder="usuario@uts.edu.co"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-oxfordGrey-700">Contrasena</label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oxfordGrey-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white pl-12 pr-12 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
              placeholder="Ingresa tu contrasena"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-oxfordGrey-400 hover:text-oxfordGrey-600 focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {error}
          </motion.div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-2xl bg-[#c8cf21] text-oxfordGrey-900 font-bold hover:bg-[#b5bc1a]"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>

        {/* 
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-oxfordGrey-200" />
          <span className="text-xs font-semibold text-oxfordGrey-400">o</span>
          <div className="h-px flex-1 bg-oxfordGrey-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleOutlook}
          className="h-14 w-full rounded-2xl border-utsGreen-200 text-utsGreen-600 hover:bg-utsGreen-50"
        >
          Ingresar con Outlook
        </Button>
        */}
      </motion.form>
    </AuthShell>
  )
}
