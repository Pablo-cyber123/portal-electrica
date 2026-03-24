const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'docs_extracted');
const destDir = path.join(__dirname, 'public', 'documentos', 'base-documental');

// Helper to sanitize and normalize names
function cleanName(name) {
  // Remove numeric prefixes from folders like "1. ESTRATÉGICOS" -> "Estratégicos"
  let clean = name.replace(/^\d+\.\s*/, '');
  // Capitalize nicely
  clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  
  // For files, remove extension temporarily
  const ext = path.extname(clean);
  let base = path.basename(clean, ext);
  
  // Clean prefixes like F-DC-123 or V4
  base = base.replace(/^[A-Z]-[A-Z]+-\d+\s*/i, '');
  base = base.replace(/\s*[vV]\d+\.?$/i, '');
  base = base.replace(/[_-]/g, ' ');
  base = base.trim();
  
  // Re-attach extension
  if (ext) {
    clean = base.charAt(0).toUpperCase() + base.slice(1) + ext.toLowerCase();
  } else {
    clean = base;
  }
  
  return clean;
}

function processDirectory(currentSrc, currentDest) {
  if (!fs.existsSync(currentDest)) {
    fs.mkdirSync(currentDest, { recursive: true });
  }

  const items = fs.readdirSync(currentSrc);
  for (const item of items) {
    const srcPath = path.join(currentSrc, item);
    const isDir = fs.statSync(srcPath).isDirectory();
    
    // Clean name for destination
    let newName = cleanName(item);
    // Special fix for common ugly names
    if (newName.includes('DOCUMENTOS DE GRADO')) newName = 'Documentos de Grado';
    if (newName.includes('ESTRATÉGICOS')) newName = 'Procesos Estratégicos';
    if (newName.includes('MISIONALES')) newName = 'Procesos Misionales';
    if (newName.includes('APOYO')) newName = 'Procesos de Apoyo';
    if (newName.includes('SEGUIMIENTO Y CONTROL')) newName = 'Seguimiento y Control';

    const destPath = path.join(currentDest, newName);

    if (isDir) {
      processDirectory(srcPath, destPath);
    } else {
      // It's a file
      // Skip hidden files or useless
      if (item.startsWith('.')) continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean target directory if exists before copying
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

processDirectory(srcDir, destDir);
console.log('Document files processed and moved to public/documentos/base-documental');
