"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface OneDriveSettings {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  driveEmail: string;
  folderPath: string;
}

export async function getOneDriveSettings(): Promise<OneDriveSettings | null> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const keys = [
    "ONEDRIVE_TENANT_ID",
    "ONEDRIVE_CLIENT_ID", 
    "ONEDRIVE_CLIENT_SECRET",
    "ONEDRIVE_DRIVE_EMAIL",
    "ONEDRIVE_FOLDER_PATH",
  ];

  const settings = await prisma.appSetting.findMany({
    where: { key: { in: keys } }
  });

  if (settings.length === 0) return null;

  const map = Object.fromEntries(settings.map(s => [s.key, s.value]));

  return {
    tenantId: map.ONEDRIVE_TENANT_ID || "",
    clientId: map.ONEDRIVE_CLIENT_ID || "",
    clientSecret: map.ONEDRIVE_CLIENT_SECRET || "",
    driveEmail: map.ONEDRIVE_DRIVE_EMAIL || "",
    folderPath: map.ONEDRIVE_FOLDER_PATH || "BaseDocumental",
  };
}

export async function saveOneDriveSettings(settings: OneDriveSettings) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  const entries = [
    { key: "ONEDRIVE_TENANT_ID", value: settings.tenantId },
    { key: "ONEDRIVE_CLIENT_ID", value: settings.clientId },
    { key: "ONEDRIVE_CLIENT_SECRET", value: settings.clientSecret },
    { key: "ONEDRIVE_DRIVE_EMAIL", value: settings.driveEmail },
    { key: "ONEDRIVE_FOLDER_PATH", value: settings.folderPath || "BaseDocumental" },
  ];

  for (const entry of entries) {
    await prisma.appSetting.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }

  return { success: true };
}

export async function testOneDriveConnection(): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, message: "Sin permisos" };
  }

  const settings = await getOneDriveSettings();
  if (!settings || !settings.tenantId || !settings.clientId || !settings.clientSecret) {
    return { success: false, message: "Configuración incompleta. Llena todos los campos primero." };
  }

  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${settings.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: settings.clientId,
          client_secret: settings.clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      }
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return { success: false, message: `Error de autenticación: ${err.error_description || err.error}` };
    }

    const tokenData = await tokenRes.json();

    // Test read access to the user's drive
    const driveRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${settings.driveEmail}/drive`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!driveRes.ok) {
      return { success: false, message: `No se pudo acceder al OneDrive de ${settings.driveEmail}. Verifica los permisos de la aplicación en Azure.` };
    }

    return { success: true, message: "✅ Conexión exitosa con OneDrive." };
  } catch (e: any) {
    return { success: false, message: `Error de red: ${e.message}` };
  }
}
