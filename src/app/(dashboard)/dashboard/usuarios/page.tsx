import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export const dynamic = "force-dynamic"

const roleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Administrador"
    case "TEACHER":
      return "Profesor"
    case "STUDENT":
      return "Estudiante"
    default:
      return "Invitado"
  }
}

export default async function UsuariosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      studentProfile: true,
      teacherProfile: true,
    }
  })

  const total = users.length
  const totalStudents = users.filter((user) => user.role === "STUDENT").length
  const totalTeachers = users.filter((user) => user.role === "TEACHER").length
  const totalAdmins = users.filter((user) => user.role === "ADMIN").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-oxfordGrey-900">Gestion de usuarios</h1>
        <p className="text-sm text-oxfordGrey-500">Vista administrativa de cuentas activas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-oxfordGrey-600">
              <Users className="h-4 w-4 text-utsGreen-600" /> Usuarios totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-oxfordGrey-900">{total}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-oxfordGrey-600">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-oxfordGrey-900">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-oxfordGrey-600">Profesores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-oxfordGrey-900">{totalTeachers}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-oxfordGrey-200 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-oxfordGrey-600">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-oxfordGrey-900">{totalAdmins}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-oxfordGrey-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-oxfordGrey-800">Listado de cuentas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-1 border-b border-oxfordGrey-100 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-oxfordGrey-900">{user.name}</p>
                <span className="rounded-full bg-utsGreen-50 px-3 py-1 text-xs font-semibold text-utsGreen-700">
                  {roleLabel(user.role)}
                </span>
              </div>
              <p className="text-sm text-oxfordGrey-500">{user.email}</p>
              {user.studentProfile ? (
                <p className="text-xs text-oxfordGrey-400">Codigo: {user.studentProfile.code}</p>
              ) : null}
              {user.teacherProfile ? (
                <p className="text-xs text-oxfordGrey-400">
                  Departamento: {user.teacherProfile.department}
                </p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
