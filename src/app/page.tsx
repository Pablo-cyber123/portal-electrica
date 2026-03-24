import { getPublicNews } from "@/actions/news"
import { default as HomePage } from "./HomePage"

export const dynamic = "force-dynamic"

// Server Component (RSC) para fetch asíncrono y ultra rápido de PostgreSQL
export default async function Page() {
  const news = await getPublicNews()
  return <HomePage initialNews={news} />
}
