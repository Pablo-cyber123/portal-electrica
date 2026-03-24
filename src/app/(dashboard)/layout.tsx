import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, LayoutDashboard, Calendar, Users, Zap, BookOpen, Beaker } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role

  return (
    <div className="min-h-screen bg-oxfordGrey-50 flex text-oxfordGrey-900 relative overflow-hidden">
      {/* Sidebar Fija Institucional */}
      <aside className="w-64 border-r border-oxfordGrey-200 bg-white flex flex-col pt-8 shadow-sm">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-2 font-black text-xl mb-1 text-oxfordGrey-900">
            <Zap className="h-5 w-5 text-utsGreen-300" /> UTS
          </div>
          <p className="text-xs text-utsGreen-800 font-mono tracking-widest uppercase">{role} PORTAL</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Resumen
          </Link>
          
          {(role === "STUDENT" || role === "TEACHER") && (
            <>
              <Link href="/dashboard/materias" className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors">
                <BookOpen className="w-4 h-4" /> {role === "STUDENT" ? "Mis Notas" : "Mis Materias"}
              </Link>
              <Link href="/dashboard/semillero-age" className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors">
                <Beaker className="w-4 h-4" /> Semillero AGE
              </Link>
            </>
          )}

          {role === "ADMIN" && (
             <Link href="/dashboard/usuarios" className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors">
               <Users className="w-4 h-4" /> Gestión Usuarios
             </Link>
          )}
          
          <Link href="/dashboard/calendario" className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors">
            <Calendar className="w-4 h-4" /> Calendario
          </Link>
        </nav>

        <div className="p-4 border-t border-oxfordGrey-200">
           <div className="mb-4 px-2">
             <p className="text-sm font-semibold text-oxfordGrey-900 truncate">{session.user.name}</p>
             <p className="text-xs text-oxfordGrey-400 truncate">{session.user.email}</p>
           </div>
           
           <form action={async () => {
             "use server"
             const { signOut } = await import("@/lib/auth")
             await signOut({ redirectTo: "/login" })
           }}>
             <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" type="submit">
               <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
             </Button>
           </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10 w-full">
         <div className="max-w-6xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  )
}
