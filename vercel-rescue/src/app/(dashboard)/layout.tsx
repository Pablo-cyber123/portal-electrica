import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TransitionLink } from "@/components/transitions/TransitionLink"
import { LogOut, LayoutDashboard, Calendar, Users, Zap, BookOpen, Beaker, ClipboardList, Cloud, Upload, Wrench } from "lucide-react"
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
    <div className="min-h-screen bg-oxfordGrey-50 flex text-oxfordGrey-900 overflow-hidden font-sans">
      
      {/* Mobile Toggle State */}
      <input type="checkbox" id="mobile-sidebar-toggle" className="peer hidden" aria-hidden="true" />

      {/* Mobile Navigation Header */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-white border-b border-oxfordGrey-200 flex items-center justify-between px-4 z-40 shadow-sm">
         <div className="flex items-center">
            <img src="/logo-electrica.png" alt="Ingeniería Eléctrica UTS" className="h-9 w-auto" />
         </div>
         <label htmlFor="mobile-sidebar-toggle" className="cursor-pointer p-2 bg-oxfordGrey-100 rounded-lg text-oxfordGrey-600 hover:text-utsGreen-800 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
         </label>
      </div>

      {/* Overlay to close sidebar on clicking outside */}
      <label htmlFor="mobile-sidebar-toggle" className="fixed inset-0 bg-oxfordGrey-900/50 backdrop-blur-sm z-40 hidden peer-checked:block md:peer-checked:hidden cursor-pointer" aria-hidden="true"></label>

      {/* Sidebar with peer-checked sliding */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-oxfordGrey-200 bg-white flex flex-col pt-8 shadow-2xl transition-transform duration-300 ease-in-out transform -translate-x-full peer-checked:translate-x-0 md:relative md:translate-x-0 md:shadow-sm h-full">

        <div className="px-6 mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center mb-1">
              <img src="/logo-electrica.png" alt="Ingeniería Eléctrica UTS" className="h-10 w-auto" />
            </div>
            <p className="text-[10px] text-utsGreen-800 font-mono tracking-widest uppercase ml-1 opacity-80">{role} PORTAL</p>
          </div>
          {/* Close button inside sidebar for mobile */}
          <label htmlFor="mobile-sidebar-toggle" className="md:hidden cursor-pointer p-2 text-oxfordGrey-400 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </label>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <TransitionLink
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Resumen
          </TransitionLink>

          {(role === "STUDENT" || role === "TEACHER") && (
            <>
              <TransitionLink
                href="/dashboard/materias"
                className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" /> {role === "STUDENT" ? "Mis Notas" : "Mis Materias"}
              </TransitionLink>
              {(role === "STUDENT" || role === "TEACHER") && (
                <TransitionLink
                  href="/dashboard/proyecto-grado"
                  className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Proyecto de Grado
                </TransitionLink>
              )}
              <TransitionLink
                href="/dashboard/semillero-age"
                className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
              >
                <Beaker className="w-4 h-4" /> Semillero AGE
              </TransitionLink>
            </>
          )}

          {role === "TEACHER" && (
            <TransitionLink
              href="/dashboard/subir-matlab"
              className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" /> Subir Proyecto Matlab
            </TransitionLink>
          )}

          {role === "STUDENT" && (
            <TransitionLink
              href="/dashboard/herramientas"
              className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
            >
              <Wrench className="w-4 h-4" /> Herramientas
            </TransitionLink>
          )}

          {role === "ADMIN" && (
            <>
              <TransitionLink
                href="/dashboard/usuarios"
                className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" /> Gestion Usuarios
              </TransitionLink>
              <TransitionLink
                href="/dashboard/configuracion"
                className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
              >
                <Cloud className="w-4 h-4" /> Configuración Nube
              </TransitionLink>
            </>
          )}

          <TransitionLink
            href="/dashboard/calendario"
            className="flex items-center gap-3 px-3 py-2 text-oxfordGrey-500 hover:text-oxfordGrey-900 hover:bg-oxfordGrey-100 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" /> Calendario
          </TransitionLink>
        </nav>

        <div className="p-4 border-t border-oxfordGrey-200 bg-white">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-oxfordGrey-900 truncate">{session.user.name}</p>
            <p className="text-xs text-oxfordGrey-400 truncate">{session.user.email}</p>
          </div>

          <form
            action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut({ redirectTo: "/login" })
            }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              type="submit"
            >
              <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24 md:pt-8 z-10 w-full transition-all">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
