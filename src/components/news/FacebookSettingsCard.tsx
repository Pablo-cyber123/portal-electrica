"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Facebook, KeyRound } from "lucide-react"
import { saveFacebookSettingsAction } from "@/actions/facebook-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Props = {
  initialPageId: string
  configured: boolean
  accessTokenMasked: string
}

export function FacebookSettingsCard({
  initialPageId,
  configured,
  accessTokenMasked
}: Props) {
  const router = useRouter()
  const [pageId, setPageId] = useState(initialPageId)
  const [accessToken, setAccessToken] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        await saveFacebookSettingsAction({
          pageId,
          accessToken,
        })
        setAccessToken("")
        setSuccess("Credenciales guardadas. La portada ya puede consultar Facebook.")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "No fue posible guardar la configuracion.")
      }
    })
  }

  return (
    <Card className="bg-white border-oxfordGrey-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="w-5 h-5 text-[#1877F2]" />
          Conexion Facebook
        </CardTitle>
        <p className="text-sm text-oxfordGrey-500">
          Guarda aqui el Page ID y el access token para cargar publicaciones reales en el inicio.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`rounded-xl border p-4 ${configured ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`mt-0.5 h-5 w-5 ${configured ? "text-emerald-600" : "text-amber-600"}`} />
            <div className="text-sm">
              <p className={`font-semibold ${configured ? "text-emerald-800" : "text-amber-800"}`}>
                {configured ? "Facebook configurado" : "Facebook aun no configurado"}
              </p>
              <p className="mt-1 text-oxfordGrey-600">
                {configured
                  ? `Token actual: ${accessTokenMasked}`
                  : "Mientras no guardes credenciales validas, la portada seguira usando publicaciones de prueba."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-oxfordGrey-700">Facebook Page ID</label>
            <Input
              value={pageId}
              onChange={(event) => setPageId(event.target.value)}
              placeholder="Ej. 123456789012345"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-oxfordGrey-700">Access Token</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-oxfordGrey-400" />
              <Input
                type="password"
                value={accessToken}
                onChange={(event) => setAccessToken(event.target.value)}
                placeholder={configured ? "Escribe uno nuevo para reemplazar el actual" : "Pega aqui el token largo de Facebook"}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Guardando..." : "Guardar conexion Facebook"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
