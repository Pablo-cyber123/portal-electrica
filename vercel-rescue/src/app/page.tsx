import { getPublicNews } from "@/actions/news"
import { default as HomePage } from "./HomePage"

export const dynamic = "force-dynamic"

// Server Component (RSC) para fetch asíncrono y ultra rápido de PostgreSQL
export default async function Page() {
  try {
    const news = await getPublicNews()
    return <HomePage initialNews={news} />
  } catch (err: any) {
    console.error("SERVER RENDER ERROR:", err)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 p-8">
        <div className="max-w-2xl bg-white p-6 rounded-lg shadow-xl font-mono text-sm">
          <h1 className="text-xl font-bold mb-4">Error 500 - Debug Info</h1>
          <pre className="whitespace-pre-wrap word-break">{err.message || String(err)}</pre>
          <p className="mt-4 text-gray-500">Call stack info omitted for security</p>
        </div>
      </div>
    )
  }
}
