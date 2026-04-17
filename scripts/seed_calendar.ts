import * as admin from "firebase-admin";
import fs from "fs";

// Cargar variables a la fuerza
const envFile = fs.readFileSync(".env", "utf-8");
let FIREBASE_PROJECT_ID = "", FIREBASE_CLIENT_EMAIL = "", FIREBASE_PRIVATE_KEY = "";

envFile.split("\n").forEach(line => {
  if (line.startsWith("FIREBASE_PROJECT_ID")) FIREBASE_PROJECT_ID = line.split("=")[1].replace(/"/g, '').trim();
  if (line.startsWith("FIREBASE_CLIENT_EMAIL")) FIREBASE_CLIENT_EMAIL = line.split("=")[1].replace(/"/g, '').trim();
  if (line.startsWith("FIREBASE_PRIVATE_KEY")) FIREBASE_PRIVATE_KEY = line.split("=")[1].replace(/"/g, '').replace(/\\n/g, "\n").trim();
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    })
  });
}
const adminDb = admin.firestore();

const events = [
  // PARCIALES
  { title: "Primer parcial", category: "Parciales", startDate: new Date("2026-03-16T00:00:00-05:00"), endDate: new Date("2026-03-21T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Supletorio primer parcial", category: "Parciales", startDate: new Date("2026-03-24T00:00:00-05:00"), endDate: new Date("2026-03-28T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Segundo parcial", category: "Parciales", startDate: new Date("2026-04-27T00:00:00-05:00"), endDate: new Date("2026-05-02T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Supletorio segundo parcial", category: "Parciales", startDate: new Date("2026-05-04T00:00:00-05:00"), endDate: new Date("2026-05-09T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Tercer parcial", category: "Parciales", startDate: new Date("2026-06-09T00:00:00-05:00"), endDate: new Date("2026-06-13T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Supletorio tercer parcial", category: "Parciales", startDate: new Date("2026-06-16T00:00:00-05:00"), endDate: new Date("2026-06-20T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Habilitaciones", category: "Parciales", startDate: new Date("2026-06-23T00:00:00-05:00"), endDate: new Date("2026-06-25T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },

  // ACADÉMICO / CLASES
  { title: "Iniciación de clases", category: "Académico", startDate: new Date("2026-02-09T00:00:00-05:00"), endDate: null, sourceUrl: "https://www.uts.edu.co" },
  { title: "Finalización de clases", category: "Académico", startDate: new Date("2026-06-06T00:00:00-05:00"), endDate: null, sourceUrl: "https://www.uts.edu.co" },
  { title: "Evaluación docente", category: "Académico", startDate: new Date("2026-04-27T00:00:00-05:00"), endDate: new Date("2026-05-17T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Cancelación de semestre", category: "Académico", startDate: new Date("2026-05-29T00:00:00-05:00"), endDate: new Date("2026-05-29T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Cancelación de cursos", category: "Académico", startDate: new Date("2026-05-30T00:00:00-05:00"), endDate: new Date("2026-05-30T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },

  // TRABAJOS DE GRADO Y CEREMONIAS
  { title: "Inscripción de la modalidad de trabajo de grado", category: "Grados", startDate: new Date("2026-03-14T00:00:00-05:00"), endDate: new Date("2026-03-14T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Cancelación del derecho pecuniario de trabajo de grado", category: "Grados", startDate: new Date("2026-04-10T00:00:00-05:00"), endDate: new Date("2026-04-10T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Aprobación de la propuesta de trabajo de grado", category: "Grados", startDate: new Date("2026-05-08T00:00:00-05:00"), endDate: new Date("2026-05-08T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Primera ceremonia de grados", category: "Grados", startDate: new Date("2026-04-09T00:00:00-05:00"), endDate: new Date("2026-04-10T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Segunda ceremonia de grados", category: "Grados", startDate: new Date("2026-06-18T00:00:00-05:00"), endDate: new Date("2026-06-19T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },

  // FINANCIERO Y ADMISIONES
  { title: "Descargue liquidación y Pago de matrícula", category: "Financiero", startDate: new Date("2026-01-02T00:00:00-05:00"), endDate: new Date("2026-01-24T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Transferencia externa y Readmisión", category: "Administrativo", startDate: new Date("2025-10-06T00:00:00-05:00"), endDate: new Date("2026-01-16T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Matrícula FCNI y FCSE", category: "Financiero", startDate: new Date("2026-01-02T00:00:00-05:00"), endDate: new Date("2026-01-24T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Cierre de registro de cursos por sistema académico", category: "Administrativo", startDate: new Date("2026-01-24T00:00:00-05:00"), endDate: new Date("2026-01-26T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Inducción y reinducción de docentes", category: "Administrativo", startDate: new Date("2026-02-23T00:00:00-05:00"), endDate: new Date("2026-02-27T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Inducción institucional a estudiantes nuevos", category: "Administrativo", startDate: new Date("2026-02-16T00:00:00-05:00"), endDate: new Date("2026-02-20T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" },
  { title: "Publicación lista de admitidos y matriculados", category: "Administrativo", startDate: new Date("2026-01-17T00:00:00-05:00"), endDate: new Date("2026-02-04T23:59:00-05:00"), sourceUrl: "https://www.uts.edu.co" }
];

const submissionWindow = {
  isActive: true,
  submissionDeadline: new Date("2026-03-14T23:59:59-05:00"),
  createdAt: new Date()
};

async function seedCalendar() {
  console.log("Iniciando reconstrucción del calendario UTS 2026-1...");
  
  // Limpiar ventanas de proyecto antiguas
  const oldWindows = await adminDb.collection("degreeProjectSubmissionWindows").get();
  for (const doc of oldWindows.docs) {
    await doc.ref.delete();
  }
  
  // Insertar nueva ventana de proyecto
  await adminDb.collection("degreeProjectSubmissionWindows").add(submissionWindow);
  console.log("✅ Límite de propuestas de grado ajustado al 14 de Marzo 2026.");

  // Limpiar eventos antiguos
  const oldEvents = await adminDb.collection("academicEvents").get();
  for (const doc of oldEvents.docs) {
    await doc.ref.delete();
  }

  // Insertar eventos
  for (const event of events) {
    await adminDb.collection("academicEvents").add(event);
    console.log(`✅ Evento cargado: ${event.title}`);
  }

  console.log("¡Semilla del Acuerdo No. 03-052 plantada exitosamente!");
  process.exit(0);
}

seedCalendar().catch(err => {
  console.error("Error al crear la base de datos:", err);
  process.exit(1);
});
