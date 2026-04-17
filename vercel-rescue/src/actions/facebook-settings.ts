"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const settingsSchema = z.object({
  pageId: z.string().min(3, "Debes ingresar el Page ID."),
  accessToken: z.string().min(20, "Debes ingresar un token valido."),
})

function maskToken(token: string) {
  if (token.length <= 10) {
    return "**********"
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

export async function getFacebookSettingsAction() {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    throw new Error("No autorizado.")
  }

  const settings = await prisma.appSetting.findMany()

  const pageId = settings.find((s) => s.key === "FACEBOOK_PAGE_ID")?.value || ""
  const accessToken = settings.find((s) => s.key === "FACEBOOK_ACCESS_TOKEN")?.value || ""

  return {
    pageId,
    accessTokenMasked: accessToken ? maskToken(accessToken) : "",
    configured: Boolean(pageId && accessToken),
  }
}

export async function saveFacebookSettingsAction(input: {
  pageId: string
  accessToken: string
}) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    throw new Error("No autorizado.")
  }

  const parsed = settingsSchema.safeParse({
    pageId: input.pageId.trim(),
    accessToken: input.accessToken.trim(),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Datos invalidos.")
  }

  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: "FACEBOOK_PAGE_ID" },
      create: { key: "FACEBOOK_PAGE_ID", value: parsed.data.pageId },
      update: { value: parsed.data.pageId }
    }),
    prisma.appSetting.upsert({
      where: { key: "FACEBOOK_ACCESS_TOKEN" },
      create: { key: "FACEBOOK_ACCESS_TOKEN", value: parsed.data.accessToken },
      update: { value: parsed.data.accessToken }
    })
  ])

  revalidatePath("/")
  revalidatePath("/dashboard")

  return {
    success: true,
    accessTokenMasked: maskToken(parsed.data.accessToken)
  }
}
