const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: '.env' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const baseDir = path.join(__dirname, 'public', 'documentos', 'base-documental');

function getCategoryName(categoryFolder) {
  // Normalize capitalizations for neat UI
  const nameMap = {
    'apoyo': 'Procesos de Apoyo',
    'estrategicos': 'Procesos Estratégicos',
    'estratégicos': 'Procesos Estratégicos',
    'misionales': 'Procesos Misionales',
    'direccionamiento tactico': 'Direccionamiento Estratégico',
    'direccionamiento estratégico': 'Direccionamiento Estratégico',
    'seguimiento y control': 'Seguimiento y Control',
    'documentos de grado': 'Documentos de Grado'
  };
  const lower = categoryFolder.toLowerCase();
  return nameMap[lower] || categoryFolder;
}

function readDocsRecursively(dir, rootDir, docsList = []) {
  if (!fs.existsSync(dir)) return docsList;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const isDir = fs.statSync(fullPath).isDirectory();

    if (item.startsWith('.')) continue;

    if (isDir) {
      readDocsRecursively(fullPath, rootDir, docsList);
    } else {
      // Find relative path for web
      const publicIndex = fullPath.replace(/\\/g, '/').toLowerCase().indexOf('/public/');
      let relativePath = fullPath.replace(/\\/g, '/').substring(publicIndex + 7);
      
      const ext = path.extname(item);
      const title = path.basename(item, ext);
      
      // Compute the immediate subfolder under "base-documental"
      const relativeToRoot = path.relative(rootDir, fullPath);
      // Example relativeToRoot: 'Apoyo\subfolder\file.pdf'
      const parts = relativeToRoot.split(path.sep);
      let folderCategory = "General";

      if (parts.length > 1) {
        // The first part is the top-level folder inside base-documental
        folderCategory = getCategoryName(parts[0]);
      } else {
        // If it's loose at the root of base-documental
        folderCategory = "General";
      }

      docsList.push({
        title: title,
        category: folderCategory,
        fileUrl: relativePath,
        published: true,
        createdAt: new Date()
      });
    }
  }
  return docsList;
}

async function runSeed() {
  const docs = readDocsRecursively(baseDir, baseDir);
  console.log(`Found ${docs.length} local documents. Re-classifying dynamically...`);

  const snapshot = await db.collection("officialDocuments").get();
  // Delete in chunks of 400
  for (let i = 0; i < snapshot.docs.length; i += 400) {
    const chunk = snapshot.docs.slice(i, i + 400);
    const batchDelete = db.batch();
    chunk.forEach(doc => batchDelete.delete(doc.ref));
    await batchDelete.commit();
  }

  console.log("Old documents deleted. Inserting with dynamic folder classification...");

  for (let i = 0; i < docs.length; i += 400) {
    const chunk = docs.slice(i, i + 400);
    const batchInsert = db.batch();
    chunk.forEach(doc => {
      const docRef = db.collection("officialDocuments").doc();
      batchInsert.set(docRef, doc);
    });
    await batchInsert.commit();
    console.log(`Inserted chunk of ${chunk.length} docs.`);
  }

  // Print an example format
  if (docs.length > 0) {
    console.log("Example inserted: ", docs[50].category, " -> ", docs[50].title);
  }

  console.log("DONE! The UI will now parse these clean dynamic categories!");
}

runSeed().catch(console.error);
