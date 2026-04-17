"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, Eye, EyeOff, CheckCircle, XCircle, Loader2, Shield } from "lucide-react"
import { getOneDriveSettings, saveOneDriveSettings, testOneDriveConnection } from "@/actions/onedrive-settings"

export default function ConfiguracionPage() {
  const [tenantId, setTenantId] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [driveEmail, setDriveEmail] = useState("")
  const [folderPath, setFolderPath] = useState("BaseDocumental")
  
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    getOneDriveSettings().then(data => {
      if (data) {
        setTenantId(data.tenantId)
        setClientId(data.clientId)
        setClientSecret(data.clientSecret)
        setDriveEmail(data.driveEmail)
        setFolderPath(data.folderPath)
      }
      setLoadingData(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    setTestResult(null)
    try {
      await saveOneDriveSettings({ tenantId, clientId, clientSecret, driveEmail, folderPath })
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await testOneDriveConnection()
      setTestResult(result)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-utsGreen-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-oxfordGrey-900">Configuración de Nube</h1>
        <p className="text-sm text-oxfordGrey-500 mt-1">Conecta tu cuenta de OneDrive/SharePoint para almacenar documentos institucionales.</p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <Shield className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-semibold mb-1">¿Cómo obtener las credenciales?</p>
          <ol className="list-decimal ml-4 space-y-1 text-xs">
            <li>Ingresa al <strong>Portal de Azure</strong> → <strong>Microsoft Entra ID</strong> → <strong>Registros de Aplicación</strong>.</li>
            <li>Crea una nueva aplicación. Copia el <strong>Application (Client) ID</strong> y el <strong>Directory (Tenant) ID</strong>.</li>
            <li>En <strong>Certificados y Secretos</strong>, crea un nuevo secreto y copia el <strong>Valor</strong>.</li>
            <li>En <strong>Permisos de API</strong>, agrega <strong>Microsoft Graph → Files.ReadWrite.All (Aplicación)</strong> y concede el consentimiento del administrador.</li>
            <li>Ingresa el correo del propietario del OneDrive donde se guardarán los archivos.</li>
          </ol>
        </div>
      </div>

      <Card className="bg-white border-oxfordGrey-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-utsGreen-800" /> Credenciales de Microsoft Azure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Tenant ID (Directory ID)</label>
              <input
                type="text"
                value={tenantId}
                onChange={e => setTenantId(e.target.value)}
                required
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 font-mono"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Client ID (Application ID)</label>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 font-mono"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                  required
                  className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 pr-10 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800 font-mono"
                  placeholder="•••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-oxfordGrey-400 hover:text-oxfordGrey-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Correo del OneDrive (Propietario)</label>
              <input
                type="email"
                value={driveEmail}
                onChange={e => setDriveEmail(e.target.value)}
                required
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                placeholder="documentos@universidad.edu.co"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxfordGrey-700 mb-1">Carpeta destino en OneDrive</label>
              <input
                type="text"
                value={folderPath}
                onChange={e => setFolderPath(e.target.value)}
                className="w-full bg-white border border-oxfordGrey-200 rounded-lg px-4 py-2 text-sm text-oxfordGrey-900 focus:outline-none focus:border-utsGreen-800 focus:ring-1 focus:ring-utsGreen-800"
                placeholder="BaseDocumental"
              />
              <p className="text-xs text-oxfordGrey-400 mt-1">Nombre de la carpeta donde se guardarán los archivos. Se creará automáticamente si no existe.</p>
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="w-4 h-4" /> Configuración guardada exitosamente.
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1 bg-utsGreen-800 hover:bg-utsGreen-900 text-white font-bold">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</> : "Guardar Configuración"}
              </Button>
              <Button
                type="button"
                onClick={handleTest}
                disabled={testing || !tenantId || !clientId || !clientSecret || !driveEmail}
                variant="outline"
                className="flex-1 border-oxfordGrey-300 text-oxfordGrey-700 hover:bg-oxfordGrey-100 font-bold"
              >
                {testing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Probando...</> : "Probar Conexión"}
              </Button>
            </div>

            {testResult && (
              <div className={`flex items-center gap-2 text-sm font-medium rounded-lg p-3 border ${testResult.success ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                {testResult.message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
