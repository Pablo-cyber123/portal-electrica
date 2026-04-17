"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BriefcaseBusiness, GraduationCap, Hash, KeyRound, Mail, UserRound, Eye, EyeOff } from "lucide-react"
import { registerUserAction } from "@/actions/auth"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"

type Role = "STUDENT" | "TEACHER"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("STUDENT")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [department, setDepartment] = useState("Ingenieria Electrica")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      await registerUserAction({
        name,
        email,
        password,
        role,
        code: role === "STUDENT" ? code : undefined,
        employeeId: role === "TEACHER" ? employeeId : undefined,
        department: role === "TEACHER" ? department : undefined,
      })

      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (loginResult?.error) {
        router.push("/login")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible crear la cuenta.")
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Registrarme"
      bottomPrompt="Ya tienes cuenta?"
      bottomCta="Iniciar sesion"
      bottomHref="/login"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-5"
      >
        <div className="grid gap-3">
          <label className="text-sm font-semibold text-oxfordGrey-700">Tipo de cuenta</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`rounded-2xl border p-4 text-left transition ${role === "STUDENT" ? "border-[#c8cf21] bg-[#fdfedf] text-oxfordGrey-900" : "border-oxfordGrey-200 bg-white text-oxfordGrey-600 hover:border-[#c8cf21]"}`}
            >
              <GraduationCap className="mb-2 h-5 w-5" />
              <p className="font-semibold">Estudiante</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`rounded-2xl border p-4 text-left transition ${role === "TEACHER" ? "border-[#c8cf21] bg-[#fdfedf] text-oxfordGrey-900" : "border-oxfordGrey-200 bg-white text-oxfordGrey-600 hover:border-[#c8cf21]"}`}
            >
              <BriefcaseBusiness className="mb-2 h-5 w-5" />
              <p className="font-semibold">Profesor</p>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-oxfordGrey-700">Nombre completo</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oxfordGrey-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white pl-12 pr-4 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
                placeholder="Nombre completo"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:col-span-2">
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
            <label className="text-sm font-semibold text-oxfordGrey-700">
              {role === "STUDENT" ? "Codigo estudiantil" : "ID docente"}
            </label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oxfordGrey-400" />
              <input
                type="text"
                required
                value={role === "STUDENT" ? code : employeeId}
                onChange={(event) => role === "STUDENT" ? setCode(event.target.value) : setEmployeeId(event.target.value)}
                className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white pl-12 pr-4 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
                placeholder={role === "STUDENT" ? "202621001" : "DOC-2040"}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-oxfordGrey-700">
              {role === "STUDENT" ? "Contrasena" : "Departamento"}
            </label>
            {role === "STUDENT" ? (
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oxfordGrey-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white pl-12 pr-12 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
                  placeholder="Minimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-oxfordGrey-400 hover:text-oxfordGrey-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            ) : (
              <input
                type="text"
                required
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white px-4 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
                placeholder="Ingenieria Electrica"
              />
            )}
          </div>

          {role === "TEACHER" ? (
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-semibold text-oxfordGrey-700">Contrasena</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oxfordGrey-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-oxfordGrey-200 bg-white pl-12 pr-12 text-oxfordGrey-900 outline-none transition placeholder:text-oxfordGrey-400 focus:border-[#c8cf21] focus:ring-2 focus:ring-[#fdfedf]"
                  placeholder="Minimo 8 caracteres"
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
          ) : null}
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
          {loading ? "Creando..." : "Registrarme"}
        </Button>
      </motion.form>
    </AuthShell>
  )
}
