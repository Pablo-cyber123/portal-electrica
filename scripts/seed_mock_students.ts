import * as dotenv from "dotenv"
import { resolve } from "path"

dotenv.config({ path: resolve(__dirname, "../.env") })

async function seedMockStudents() {
  console.log("🚀 Iniciando carga de estudiantes de prueba...")
  
  // Importación dinámica para asegurar que dotenv ya se ejecutó
  const { db } = await import("../src/lib/firebase-admin")

  const subjectCode = "MMUSFI" // Circuitos II
  const subjectSnapshot = await db.collection("subjects").where("code", "==", subjectCode).limit(1).get()
  
  if (subjectSnapshot.empty) {
    console.error("❌ Materia MMUSFI no encontrada.")
    return
  }
  
  const subjectId = subjectSnapshot.docs[0].id
  const subjectData = subjectSnapshot.docs[0].data()
  const teacherId = subjectData.teacherId

  const mockStudents = [
    { name: "Juan Pérez", email: "juan.perez@estudiante.uts.edu.co", code: "1098765432", cc: "1098765432" },
    { name: "María Rodriguez", email: "maria.rod@estudiante.uts.edu.co", code: "1098555444", cc: "1098555444" },
    { name: "Carlos Vaca", email: "carlos.vaca@estudiante.uts.edu.co", code: "1098111222", cc: "1098111222" }
  ]

  for (const student of mockStudents) {
    // 1. Crear Usuario
    const userRef = await db.collection("users").add({
      name: student.name,
      email: student.email,
      role: "STUDENT",
      createdAt: new Date()
    })

    // 2. Crear Perfil de Estudiante
    const profileRef = await db.collection("studentProfiles").add({
      userId: userRef.id,
      name: student.name,
      code: student.code,
      identification: student.cc,
      program: "Ingeniería Eléctrica",
      semester: 5,
      createdAt: new Date()
    })

    // 3. Crear Inscripción
    await db.collection("enrollments").add({
      studentId: profileRef.id,
      subjectId: subjectId,
      teacherId: teacherId,
      enrolledAt: new Date(),
      grades: [
        { cutNumber: 1, score: 3.5, evaluationScore: 3.0, tasksScore: 4.5, selfEvaluationScore: 4.0 },
        { cutNumber: 2, score: 0, evaluationScore: 0, tasksScore: 0, selfEvaluationScore: 0 },
        { cutNumber: 3, score: 0, evaluationScore: 0, tasksScore: 0, selfEvaluationScore: 0 }
      ],
      updatedAt: new Date()
    })

    console.log(`✅ Estudiante ${student.name} matriculado con éxito.`)
  }

  console.log("✨ Proceso de carga finalizado.")
}

seedMockStudents().catch(console.error)
