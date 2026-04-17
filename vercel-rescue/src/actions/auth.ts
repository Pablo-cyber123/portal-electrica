"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(4, "Escribe tu nombre completo."),
  email: z.string().email("Ingresa un correo valido."),
  password: z.string().min(8, "La contrasena debe tener minimo 8 caracteres."),
  role: z.enum(["STUDENT", "TEACHER"]),
  code: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
})

export async function registerUserAction(input: {
  name: string
  email: string
  password: string
  role: "STUDENT" | "TEACHER"
  code?: string
  employeeId?: string
  department?: string
}) {
  const parsed = registerSchema.safeParse(input)

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Datos invalidos.")
  }

  const { name, email, password, role } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = parsed.data.code?.trim()
  const normalizedEmployeeId = parsed.data.employeeId?.trim()
  const normalizedDepartment = parsed.data.department?.trim() || "Ingenieria Electrica"

  if (role === "STUDENT" && !normalizedCode) {
    throw new Error("El codigo estudiantil es obligatorio.")
  }

  if (role === "TEACHER" && !normalizedEmployeeId) {
    throw new Error("El ID del docente es obligatorio.")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  })

  if (existingUser) {
    throw new Error("Ya existe una cuenta con ese correo.")
  }

  if (role === "STUDENT" && normalizedCode) {
    const existingStudent = await prisma.studentProfile.findUnique({
      where: { code: normalizedCode }
    })

    if (existingStudent) {
      throw new Error("Ese codigo estudiantil ya esta registrado.")
    }
  }

  if (role === "TEACHER" && normalizedEmployeeId) {
    const existingTeacher = await prisma.teacherProfile.findUnique({
      where: { employeeId: normalizedEmployeeId }
    })

    if (existingTeacher) {
      throw new Error("Ese ID docente ya esta registrado.")
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: passwordHash,
          role,
        }
      })

      if (role === "STUDENT" && normalizedCode) {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            code: normalizedCode,
            status: "ACTIVE",
          }
        })
      } else if (role === "TEACHER" && normalizedEmployeeId) {
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            employeeId: normalizedEmployeeId,
            department: normalizedDepartment,
          }
        })
      }
    })
  } catch (error) {
    console.error("Error creating user in Postgres:", error)
    throw new Error("Error al crear la cuenta. Intenta de nuevo.")
  }

  return { success: true }
}
