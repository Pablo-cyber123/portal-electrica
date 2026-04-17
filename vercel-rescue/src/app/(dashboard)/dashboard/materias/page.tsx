import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

async function createSubjectAction(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard/materias?error=No+autorizado.")
  }

  const code = String(formData.get("code") || "").trim()
  const name = String(formData.get("name") || "").trim()
  const creditsValue = String(formData.get("credits") || "").trim()

  if (!code || !name || !creditsValue) {
    redirect("/dashboard/materias?error=Datos+incompletos.+Llena+todos+los+campos.")
  }

  const credits = Number(creditsValue)
  if (Number.isNaN(credits) || credits <= 0) {
    redirect("/dashboard/materias?error=Créditos+inválidos.")
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!teacherProfile) {
    redirect("/dashboard/materias?error=Perfil+docente+no+encontrado.")
  }

  await prisma.subject.create({
    data: {
      code,
      name,
      credits,
      semester: 1, // Fallback ya que no está en el form
      teacherId: teacherProfile.id,
    }
  })

  redirect("/dashboard/materias?success=Materia+creada+exitosamente.")
}

export default async function MateriasPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role

  if (role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return <p className="text-sm text-oxfordGrey-500">Perfil de estudiante no encontrado.</p>
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: studentProfile.id },
      include: {
        subject: true,
        grades: true
      }
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-oxfordGrey-900">Mis Notas</h1>
          <p className="text-sm text-oxfordGrey-500">Resumen de materias y cortes actuales.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => {
            const grades = enr.grades || []
            const c1 = grades.find((g) => g.cutNumber === 1)
            const c2 = grades.find((g) => g.cutNumber === 2)
            const c3 = grades.find((g) => g.cutNumber === 3)
            const subjectLink = enr.subject.code || enr.subject.id

            return (
              <Link href={`/dashboard/subject/${encodeURIComponent(subjectLink)}`} key={enr.id} className="block group">
                <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-300 transition-all duration-300 group-hover:shadow-lg h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-oxfordGrey-900 font-bold group-hover:text-utsGreen-800 transition-colors">
                      {enr.subject.name}
                    </CardTitle>
                    <p className="text-xs text-oxfordGrey-400 font-mono">
                      Cod: {enr.subject.code} • {enr.subject.credits} Creditos
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mt-4 text-sm bg-oxfordGrey-50 p-3 rounded-lg border border-oxfordGrey-200">
                      <div className="flex flex-col items-center">
                        <span className="text-oxfordGrey-400 text-xs mb-1">Corte 1</span>
                        <span
                          className={`font-black text-lg ${
                            c1 ? (c1.score >= 3.0 ? "text-utsGreen-600" : "text-red-500") : "text-oxfordGrey-300"
                          }`}
                        >
                          {c1 ? c1.score.toFixed(1) : "-.-"}
                        </span>
                      </div>
                      <div className="w-px bg-oxfordGrey-200 self-stretch" />
                      <div className="flex flex-col items-center">
                        <span className="text-oxfordGrey-400 text-xs mb-1">Corte 2</span>
                        <span
                          className={`font-black text-lg ${
                            c2 ? (c2.score >= 3.0 ? "text-utsGreen-600" : "text-red-500") : "text-oxfordGrey-300"
                          }`}
                        >
                          {c2 ? c2.score.toFixed(1) : "-.-"}
                        </span>
                      </div>
                      <div className="w-px bg-oxfordGrey-200 self-stretch" />
                      <div className="flex flex-col items-center">
                        <span className="text-oxfordGrey-400 text-xs mb-1">Corte 3</span>
                        <span
                          className={`font-black text-lg ${
                            c3 ? (c3.score >= 3.0 ? "text-utsGreen-600" : "text-red-500") : "text-oxfordGrey-300"
                          }`}
                        >
                          {c3 ? c3.score.toFixed(1) : "-.-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  if (role === "TEACHER") {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return <p className="text-sm text-oxfordGrey-500">Perfil docente no encontrado.</p>
    }

    const subjects = await prisma.subject.findMany({
      where: { teacherId: teacherProfile.id }
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-oxfordGrey-900">Mis Materias</h1>
          <p className="text-sm text-oxfordGrey-500">Materias asignadas a tu perfil docente.</p>
        </div>

        <Card className="bg-white border-oxfordGrey-200">
          <CardHeader>
            <CardTitle className="text-lg">Crear materia</CardTitle>
          </CardHeader>
          <CardContent>
            {searchParams?.error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {searchParams.error}
              </div>
            )}
            {searchParams?.success && (
              <div className="mb-4 rounded-xl border border-utsGreen-200 bg-utsGreen-50 p-3 text-sm text-utsGreen-700">
                {searchParams.success}
              </div>
            )}
            <form action={createSubjectAction} className="grid gap-3 md:grid-cols-4">
              <label className="text-xs text-oxfordGrey-500 flex flex-col gap-1">
                Codigo
                <input
                  name="code"
                  placeholder="ELE-201"
                  className="h-10 rounded-xl border border-oxfordGrey-200 px-3 text-sm"
                />
              </label>
              <label className="text-xs text-oxfordGrey-500 flex flex-col gap-1 md:col-span-2">
                Nombre
                <input
                  name="name"
                  placeholder="Circuitos Electricos II"
                  className="h-10 rounded-xl border border-oxfordGrey-200 px-3 text-sm"
                />
              </label>
              <label className="text-xs text-oxfordGrey-500 flex flex-col gap-1">
                Creditos
                <input
                  name="credits"
                  type="number"
                  min="1"
                  max="10"
                  className="h-10 rounded-xl border border-oxfordGrey-200 px-3 text-sm"
                />
              </label>
              <button
                type="submit"
                className="h-10 rounded-xl bg-utsGreen-600 text-sm font-semibold text-white hover:bg-utsGreen-500 md:col-span-4"
              >
                Crear materia
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const subjectLink = subject.code || subject.id
            return (
              <Link
                href={`/dashboard/subject/${encodeURIComponent(subjectLink)}`}
                key={subject.id}
                className="block group"
              >
                <Card className="bg-white border-oxfordGrey-200 group-hover:border-utsGreen-300 transition-all duration-300 group-hover:shadow-lg h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-oxfordGrey-900 font-bold group-hover:text-utsGreen-800 transition-colors">
                      {subject.name}
                    </CardTitle>
                    <p className="text-xs text-oxfordGrey-400 font-mono">
                      Cod: {subject.code} • {subject.credits} Creditos
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mt-2 text-sm bg-oxfordGrey-50 p-3 rounded-lg border border-oxfordGrey-200">
                      <span className="text-oxfordGrey-400 text-xs">Ir al Muro de la Materia</span>
                      <BookOpen className="w-4 h-4 text-utsGreen-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          {subjects.length === 0 && (
            <Card className="bg-white border-oxfordGrey-200">
              <CardContent className="p-6 text-sm text-oxfordGrey-500">
                No tienes materias asignadas actualmente.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-utsGreen-50 flex items-center justify-center">
        <GraduationCap className="w-6 h-6 text-utsGreen-600" />
      </div>
      <p className="text-sm text-oxfordGrey-500">Esta vista solo aplica para estudiantes y docentes.</p>
    </div>
  )
}
