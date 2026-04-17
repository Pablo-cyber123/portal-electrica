const fs = require('fs');
const path = require('path');

// 1. Update tailwind.config.ts
const tailwindPath = path.join(__dirname, 'tailwind.config.ts');
let twContent = fs.readFileSync(tailwindPath, 'utf8');
if (!twContent.includes("950: '#1a1f0a'")) {
  twContent = twContent.replace(
    /900: '#2a3310',/,
    "900: '#2a3310',\n          950: '#1a1f0a',"
  );
  fs.writeFileSync(tailwindPath, twContent);
}

// 2. Update all src files
const srcDir = path.join(__dirname, 'src');
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (filePath.endsWith('FacebookFeed.tsx')) {
        content = content.replace(/bg-\[#111\]/g, 'bg-white');
        
        content = content.replace(/text-white\/50 hover:text-white/g, 'text-oxfordGrey-500 hover:text-oxfordGrey-900');
        content = content.replace(/text-white/g, 'text-oxfordGrey-900');
        
        content = content.replace(/text-\[#0af\]/g, 'text-utsGreen-600');
        content = content.replace(/bg-\[#0af\]/g, 'bg-utsGreen-500');
        content = content.replace(/shadow-\[0_0_10px_#0af\]/g, 'shadow-md border border-utsGreen-200');
        content = content.replace(/border-\[#0af\]\/30/g, 'border-utsGreen-200');
        content = content.replace(/border-\[#0af\]\/20/g, 'border-utsGreen-200');
        content = content.replace(/border-\[#0af\]/g, 'border-utsGreen-500');
        content = content.replace(/text-gray-300/g, 'text-oxfordGrey-700');
        content = content.replace(/text-gray-400/g, 'text-oxfordGrey-500');
        content = content.replace(/bg-black\/40/g, 'bg-oxfordGrey-900/40');
        content = content.replace(/shadow-\[0_0_30px_rgba\(0,170,255,0\.3\)\]/g, 'shadow-2xl');
        content = content.replace(/shadow-\[0_0_15px_rgba\(0,170,255,0\.4\)\]/g, 'shadow-lg');
        content = content.replace(/bg-black border-r/g, 'bg-oxfordGrey-50 border-r');
        content = content.replace(/bg-white\/5/g, 'bg-oxfordGrey-50');
        content = content.replace(/border-white\/10/g, 'border-oxfordGrey-200');
        content = content.replace(/hover:bg-\[#0088cc\]/g, 'hover:bg-utsGreen-600');
        
        // Fix badges and buttons
        content = content.replace(/bg-utsGreen-500 text-oxfordGrey-900 px-4/g, 'bg-utsGreen-500 text-white px-4');
        content = content.replace(/bg-utsGreen-500 text-oxfordGrey-900 px-6/g, 'bg-utsGreen-500 text-white px-6');
        
        content = content.replace(/bg-black\/95/g, 'bg-oxfordGrey-900/95');
        
        content = content.replace(/bg-black\/50 hover:bg-utsGreen-500 text-oxfordGrey-900/g, 'bg-oxfordGrey-200 hover:bg-utsGreen-500 text-oxfordGrey-900 hover:text-white');
    }

    // Replace all 'vinotinto' with 'utsGreen' globally
    content = content.replace(/vinotinto/g, 'utsGreen');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${path.basename(filePath)}`);
    }
  }
});
