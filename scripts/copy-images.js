const fs = require('fs');
const path = require('path');

const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Копируем public/images в dist/images
const src = path.join(__dirname, '..', 'public', 'images');
const dest = path.join(__dirname, '..', 'dist', 'images');

if (fs.existsSync(src)) {
  copyDir(src, dest);
  console.log('✅ Images copied to dist/images');
} else {
  console.log('⚠️ No public/images folder found');
}