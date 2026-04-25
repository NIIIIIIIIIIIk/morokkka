import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const distPath = './dist';

console.log('🔍 Checking build output...\n');

// Проверяем наличие index.html
const indexExists = existsSync(join(distPath, 'index.html'));
console.log(indexExists ? '✅ index.html found' : '❌ index.html NOT found');

// Проверяем структуру
if (existsSync(distPath)) {
  const files = readdirSync(distPath);
  console.log('\n📁 Files in dist/:');
  files.forEach(file => console.log(`   - ${file}`));
  
  const assetsPath = join(distPath, 'assets');
  if (existsSync(assetsPath)) {
    const assets = readdirSync(assetsPath);
    console.log('\n📁 Files in dist/assets/:');
    assets.forEach(file => console.log(`   - ${file}`));
  }
}

// Проверяем index.html на правильные пути
if (indexExists) {
  const indexContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
  console.log('\n🔗 Checking asset paths in index.html:');
  
  const cssMatch = indexContent.match(/href="([^"]+\.css)"/);
  const jsMatch = indexContent.match(/src="([^"]+\.js)"/);
  
  if (cssMatch) console.log(`   CSS: ${cssMatch[1]}`);
  if (jsMatch) console.log(`   JS: ${jsMatch[1]}`);
  
  // Проверяем base path
  const baseMatch = indexContent.match(/<base href="([^"]+)"/);
  if (baseMatch) console.log(`   Base: ${baseMatch[1]}`);
}