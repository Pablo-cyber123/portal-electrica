import * as admin from "firebase-admin";
import bcrypt from "bcryptjs";
import fs from "fs";

// Cargar variables a la fuerza para evitar problemas de codificación de Windows/.env
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

const users = [
  {
    email: "admin@uts.edu.co",
    password: "adminPassword123",
    name: "Administrador",
    role: "ADMIN"
  },
  {
    email: "docente@uts.edu.co",
    password: "docentePassword123",
    name: "Docente de Prueba",
    role: "TEACHER"
  },
  {
    email: "estudiante@uts.edu.co",
    password: "estudiantePassword123",
    name: "Estudiante de Prueba",
    role: "STUDENT"
  }
];

async function seedUsers() {
  console.log("Creando usuarios de prueba...");
  
  for (const user of users) {
    const userSnapshot = await adminDb.collection("users")
      .where("email", "==", user.email)
      .limit(1)
      .get();

    const hashedPassword = await bcrypt.hash(user.password, 10);

    let userId = "";
    if (userSnapshot.empty) {
      // Create user
      const res = await adminDb.collection("users").add({
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        createdAt: new Date()
      });
      userId = res.id;
      console.log(`✅ Creado: ${user.email} (${user.role})`);
    } else {
      // Update existing user with known password
      userId = userSnapshot.docs[0].id;
      await adminDb.collection("users").doc(userId).update({
        password: hashedPassword,
        name: user.name,
        role: user.role
      });
      console.log(`🔄 Actualizado: ${user.email} (${user.role})`);
    }

    // Sync profiles
    if (user.role === "TEACHER") {
      const tp = await adminDb.collection("teacherProfiles").where("userId", "==", userId).get();
      if (tp.empty) {
         await adminDb.collection("teacherProfiles").add({
           userId,
           department: "Sistemas Eléctricos",
           isActive: true,
           createdAt: new Date()
         });
         console.log(`   └─ Creado: Perfil Docente`);
      }
    } else if (user.role === "STUDENT") {
      const sp = await adminDb.collection("studentProfiles").where("userId", "==", userId).get();
      if (sp.empty) {
         await adminDb.collection("studentProfiles").add({
           userId,
           program: "Ingeniería Eléctrica",
           semester: 1,
           isActive: true,
           createdAt: new Date()
         });
         console.log(`   └─ Creado: Perfil Estudiante`);
      }
    }
  }

  console.log("¡Proceso terminado!");
  process.exit(0);
}

seedUsers().catch(err => {
  console.error("Error al crear usuarios:", err);
  process.exit(1);
});
